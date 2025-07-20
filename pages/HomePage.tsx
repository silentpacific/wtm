import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { analyzeMenu } from '../services/geminiService';
import { MenuSection, DishExplanation, MenuAnalysisResult } from '../types';
import { CameraIcon, UploadIcon } from '../components/icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { incrementMenuScanned, incrementDishExplanation } from '../services/counterService';
import { LanguageSelector } from '../components/LanguageSelector';
import { getUserLocation, findOrCreateRestaurant } from '../services/restaurantService';

interface HomePageProps {
  onScanSuccess: () => void;
}

interface UserProfile {
  id: string;
  email: string;
  subscription_type: 'free' | 'daily' | 'weekly';
  subscription_expires_at: string | null;
  scans_used: number;
  scans_limit: number;
}

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return await base64EncodedDataPromise;
};

const CameraModal: React.FC<{
    onClose: () => void;
    onCapture: (base64Image: string) => void;
}> = ({ onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Could not access camera. Please ensure permissions are granted.");
                onClose();
            }
        };
        startCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if(context){
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/jpeg');
                
                // Track camera capture
                gtag('event', 'menu_upload_method', {
                    'upload_type': 'camera_capture',
                    'file_type': 'jpeg',
                    'file_size_kb': Math.round(dataUrl.length * 0.75 / 1024), // Estimate base64 size
                    'image_width': video.videoWidth,
                    'image_height': video.videoHeight
                });
                
                onCapture(dataUrl.split(',')[1]);
                onClose();
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-charcoal/80 flex items-center justify-center z-50 p-4">
            <div className="bg-cream rounded-2xl p-4 border-4 border-charcoal w-full max-w-3xl">
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg border-2 border-charcoal"></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
                <div className="flex justify-between items-center mt-4">
                    <button onClick={onClose} className="px-6 py-2 bg-stone-200 text-charcoal rounded-full font-bold border-2 border-charcoal">Close</button>
                    <button onClick={handleCapture} className="px-8 py-3 bg-coral text-white rounded-full font-bold border-4 border-charcoal shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">Capture</button>
                </div>
            </div>
        </div>
    );
};

const ScanLimitModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile | null;
    isLoggedIn: boolean;
}> = ({ isOpen, onClose, userProfile, isLoggedIn }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-charcoal/80 flex items-center justify-center z-50 p-4">
            <div className="bg-cream rounded-2xl p-6 border-4 border-charcoal w-full max-w-md">
                <h2 className="text-2xl font-black text-charcoal mb-4">Scan Limit Reached!</h2>
                
                {!isLoggedIn ? (
                    <div className="space-y-4">
                        <p className="text-charcoal/80">
                            You've used all 5 free scans. Sign up for an account to get more scans!
                        </p>
                        <div className="space-y-2">
                            <button className="w-full py-3 bg-coral text-white font-bold rounded-lg border-2 border-charcoal">
                                Sign Up for Free Account
                            </button>
                            <button className="w-full py-2 text-charcoal/70 underline">
                                Already have an account? Login
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-charcoal/80">
                            You've used all {userProfile?.scans_limit || 5} free scans. Upgrade to continue scanning menus!
                        </p>
                        <div className="space-y-2">
                            <button className="w-full py-3 bg-coral text-white font-bold rounded-lg border-2 border-charcoal">
                                Get Daily Pass ($1)
                            </button>
                            <button className="w-full py-3 bg-yellow text-charcoal font-bold rounded-lg border-2 border-charcoal">
                                Get Weekly Pass ($5)
                            </button>
                        </div>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-charcoal hover:text-coral text-xl"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

const HeroSection: React.FC<{ 
    onImageSelect: (file: File) => void; 
    onBase64Select: (base64: string) => void;
    canScan: boolean;
    onScanAttempt: () => void;
}> = ({ onImageSelect, onBase64Select, canScan, onScanAttempt }) => {
    const [showCamera, setShowCamera] = useState(false);
    
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            if (canScan) {
                onImageSelect(acceptedFiles[0]);
            } else {
                onScanAttempt();
            }
        }
    }, [onImageSelect, canScan, onScanAttempt]);

    const handleCameraCapture = (base64: string) => {
        if (canScan) {
            onBase64Select(base64);
        } else {
            onScanAttempt();
        }
    };

    const handleCameraClick = () => {
        if (canScan) {
            setShowCamera(true);
        } else {
            onScanAttempt();
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
        multiple: false
    });

    const boxStyle = `w-full sm:w-auto flex-1 p-6 border-4 border-charcoal rounded-2xl cursor-pointer transition-all bg-white shadow-[8px_8px_0px_#292524] hover:shadow-[10px_10px_0px_#292524] hover:-translate-y-1 ${!canScan ? 'opacity-75' : ''}`;

    return (
        <>
            {showCamera && <CameraModal onClose={() => setShowCamera(false)} onCapture={handleCameraCapture} />}
            <div className="text-center py-20 sm:py-28 px-4">
                <h1 className="font-black text-5xl sm:text-6xl lg:text-7xl text-charcoal tracking-tighter">
                    Menu Scanner <span className="text-coral">&</span> Explainer
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-xl text-charcoal/80 font-medium">
                    Waiter doesn't have time to explain every little dish? No worries! <br></br>Get your answers here.
                </p>
                <div className="mt-12 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-8">
                    <div {...getRootProps()} className={`${boxStyle} ${isDragActive ? 'bg-yellow shadow-[10px_10px_0px_#1DD1A1]' : 'bg-white'}`}>
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center text-center">
                            <UploadIcon className="w-16 h-16 text-charcoal mb-2"/>
                            <p className="font-bold text-xl text-charcoal">Drop image here</p>
                            <p className="text-md text-charcoal/70">or click to upload</p>
                        </div>
                    </div>
                     <div className="text-charcoal/50 font-black text-2xl hidden sm:block">OR</div>
                    <button onClick={handleCameraClick} className={`${boxStyle} hover:shadow-[10px_10px_0px_#FF6B6B] flex flex-col items-center justify-center`}>
                         <CameraIcon className="w-16 h-16 text-charcoal mb-2"/>
                        <p className="font-bold text-xl text-charcoal">Take a picture</p>
                        <p className="text-md text-charcoal/70">using your camera</p>
                    </button>
                </div>
                
                {!canScan && (
                    <div className="mt-8 max-w-md mx-auto">
                        <div className="bg-yellow/20 border-2 border-yellow rounded-lg p-4">
                            <p className="text-charcoal font-bold text-center">
                                📸 Scan limit reached! Upgrade to continue scanning menus.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

const MenuResults: React.FC<{ 
    menuSections: MenuSection[]; 
    restaurantInfo?: { 
        name: string; 
        cuisine: string; 
        location: any;
        id?: number;
    } 
}> = ({ menuSections, restaurantInfo }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [explanations, setExplanations] = useState<Record<string, Record<string, {
        data: DishExplanation | null;
        isLoading: boolean;
        error: string | null;
    }>>>({});
    const [expandedDishes, setExpandedDishes] = useState<Set<string>>(new Set());

    // Load language preference from localStorage
    useEffect(() => {
        const savedLanguage = localStorage.getItem('preferred-language');
        if (savedLanguage && ['en', 'es', 'zh', 'fr'].includes(savedLanguage)) {
            setSelectedLanguage(savedLanguage);
        }
    }, []);

    // Handle language change
    const handleLanguageChange = (languageCode: string) => {
        setSelectedLanguage(languageCode);
        localStorage.setItem('preferred-language', languageCode);
    };

    // Toggle dish expansion for mobile accordion
    const toggleDishExpansion = (dishName: string) => {
        setExpandedDishes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(dishName)) {
                newSet.delete(dishName);
            } else {
                newSet.add(dishName);
            }
            return newSet;
        });
    };

    // Translations object
    const translations = {
        en: {
            pageTitle: "Your Menu",
            allergenWarning: "Important: Always double-check with the restaurant about allergens and ingredients. AI descriptions are for guidance only.",
            dishName: "Dish Name",
            explanation: "Explanation",
            explaining: "Explaining...",
            error: "Error: ",
            dietaryStyle: "Dietary & Style",
            allergenInfo: "Allergen Information",
        // NEW: Friendly retry messages
        serversBusy: "Oops! Too many hungry people asking about dishes! Give me a moment to catch up... 🍽️",
        stillTrying: "Still cooking up your answer... Almost there! 👨‍🍳",
        finalError: "Hmm, our kitchen is really backed up! Please try again in a minute! 😅"
        },
        es: {
            pageTitle: "Tu Menú",
            allergenWarning: "Importante: Siempre confirma con el restaurante sobre alérgenos e ingredientes. Las descripciones de IA son solo una guía.",
            dishName: "Nombre del Plato",
            explanation: "Explicación",
            explaining: "Explicando...",
            error: "Error: ",
            dietaryStyle: "Dieta y Estilo",
            allergenInfo: "Información de Alérgenos",
        // NEW: Friendly retry messages
        serversBusy: "¡Ups! ¡Demasiada gente hambrienta preguntando sobre platos! Dame un momento para ponerme al día... 🍽️",
        stillTrying: "Todavía cocinando tu respuesta... ¡Casi listo! 👨‍🍳",
        finalError: "¡Hmm, nuestra cocina está muy ocupada! ¡Inténtalo de nuevo en un minuto! 😅"
        },
        zh: {
            pageTitle: "您的菜单",
            allergenWarning: "重要提示：请务必与餐厅确认过敏原和成分信息。AI描述仅供参考。",
            dishName: "菜名",
            explanation: "说明",
            explaining: "解释中...",
            error: "错误: ",
            dietaryStyle: "饮食与风格",
            allergenInfo: "过敏原信息",
        // NEW: Friendly retry messages
        serversBusy: "哎呀！太多饿肚子的人在问菜品了！给我一点时间赶上... 🍽️",
        stillTrying: "还在为您烹饪答案...快好了！👨‍🍳",
        finalError: "嗯，我们的厨房真的很忙！请一分钟后再试！😅"
        },
        fr: {
            pageTitle: "Votre Menu",
            allergenWarning: "Important : Vérifiez toujours avec le restaurant concernant les allergènes et les ingrédients. Les descriptions IA sont uniquement à titre indicatif.",
            dishName: "Nom du Plat",
            explanation: "Explication",
            explaining: "Explication...",
            error: "Erreur: ",
            dietaryStyle: "Régime et Style",
            allergenInfo: "Informations Allergènes",
        // NEW: Friendly retry messages
        serversBusy: "Oups ! Trop de gens affamés posent des questions sur les plats ! Donnez-moi un moment pour rattraper... 🍽️",
        stillTrying: "Je cuisine encore votre réponse... Presque là ! 👨‍🍳",
        finalError: "Hmm, notre cuisine est vraiment occupée ! Réessayez dans une minute ! 😅"
        }
    };

    const t = translations[selectedLanguage as keyof typeof translations];

    // Language options - clean names only
    const languageOptions = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'zh', name: '中文' },
        { code: 'fr', name: 'Français' },
    ];


// Replace the handleDishClick function in MenuResults component (HomePage.tsx)

const handleDishClick = async (dishName: string) => {
    if (!explanations[dishName]) {
        explanations[dishName] = {};
    }
    
    if (explanations[dishName][selectedLanguage]) return;
    
    // Helper function to make the API request
    const makeRequest = async (): Promise<DishExplanation> => {
        let url = `/.netlify/functions/getDishExplanation?dishName=${encodeURIComponent(dishName)}&language=${selectedLanguage}`;
        
        if (restaurantInfo?.id) {
            url += `&restaurantId=${restaurantInfo.id}`;
        }
        
        if (restaurantInfo?.name) {
            url += `&restaurantName=${encodeURIComponent(restaurantInfo.name)}`;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('RATE_LIMIT');
            } else {
                const errorData = await response.json().catch(() => ({error: `Request failed with status ${response.status}`}));
                throw new Error(errorData.error || `Request failed`);
            }
        }
        
        return await response.json();
    };

    // Auto-retry logic with friendly messages
    const startTime = Date.now();
    let retryCount = 0;
    const maxRetries = 2; // Try initial + 2 retries = 3 total attempts
    const retryDelays = [3000, 5000]; // 3 seconds, then 5 seconds

    setExplanations(prev => ({
        ...prev,
        [dishName]: {
            ...prev[dishName],
            [selectedLanguage]: { data: null, isLoading: true, error: null }
        }
    }));

    const attemptRequest = async (): Promise<void> => {
        try {
            const data = await makeRequest();
            const loadTime = Date.now() - startTime;
            const dataSource = 'api'; // We can get this from response headers if needed
            
            // Track successful dish explanation
            gtag('event', 'dish_explanation_success', {
                'dish_name': dishName,
                'language': selectedLanguage,
                'load_time_ms': loadTime,
                'source': dataSource,
                'restaurant_name': restaurantInfo?.name || 'unknown',
                'restaurant_cuisine': restaurantInfo?.cuisine || 'unknown',
                'retry_count': retryCount
            });
            
            await incrementDishExplanation();
            
            setExplanations(prev => ({
                ...prev,
                [dishName]: {
                    ...prev[dishName],
                    [selectedLanguage]: { data, isLoading: false, error: null }
                }
            }));

        } catch (err) {
            if (err instanceof Error && err.message === 'RATE_LIMIT' && retryCount < maxRetries) {
                // Show friendly message for rate limit
                const isFirstRetry = retryCount === 0;
                const message = isFirstRetry ? t.serversBusy : t.stillTrying;
                
                setExplanations(prev => ({
                    ...prev,
                    [dishName]: {
                        ...prev[dishName],
                        [selectedLanguage]: { data: null, isLoading: true, error: message }
                    }
                }));

                // Wait and retry
                const delay = retryDelays[retryCount];
                retryCount++;
                
                setTimeout(() => {
                    // Clear the message and show loading again
                    setExplanations(prev => ({
                        ...prev,
                        [dishName]: {
                            ...prev[dishName],
                            [selectedLanguage]: { data: null, isLoading: true, error: null }
                        }
                    }));
                    
                    attemptRequest();
                }, delay);

            } else {
                // Final error - either max retries exceeded or non-rate-limit error
                const loadTime = Date.now() - startTime;
                let errorMessage = t.finalError;
                
                if (err instanceof Error && err.message !== 'RATE_LIMIT') {
                    errorMessage = err.message;
                }
                
                // Track failed dish explanation
                gtag('event', 'dish_explanation_error', {
                    'dish_name': dishName,
                    'language': selectedLanguage,
                    'load_time_ms': loadTime,
                    'error_message': errorMessage,
                    'error_type': err instanceof Error && err.message === 'RATE_LIMIT' ? 'rate_limit_final' : 'other',
                    'restaurant_name': restaurantInfo?.name || 'unknown',
                    'restaurant_cuisine': restaurantInfo?.cuisine || 'unknown',
                    'retry_count': retryCount
                });
                
                setExplanations(prev => ({
                    ...prev,
                    [dishName]: {
                        ...prev[dishName],
                        [selectedLanguage]: { data: null, isLoading: false, error: errorMessage }
                    }
                }));
            }
        }
    };

    // Start the initial request
    attemptRequest();
};


    // Handle mobile accordion click
    const handleMobileAccordionClick = (dishName: string) => {
        // Toggle accordion expansion
        toggleDishExpansion(dishName);
        
        // Fetch explanation if not already fetched/loading and accordion is being expanded
        if (!expandedDishes.has(dishName) && !explanations[dishName]?.[selectedLanguage]) {
            handleDishClick(dishName);
        }
    };

    // Render explanation content (shared between desktop and mobile)
// Update the renderExplanationContent function in MenuResults component (HomePage.tsx)

// Update the renderExplanationContent function in MenuResults component (HomePage.tsx)

const renderExplanationContent = (dish: any) => {
    const dishExplanation = explanations[dish.name]?.[selectedLanguage];
    
    if (dishExplanation?.isLoading) {
        return (
            <div className="flex items-center space-x-2 font-medium">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-coral"></div>
                <span>{dishExplanation.error || t.explaining}</span>
            </div>
        );
    }
    
    if (dishExplanation?.error) {
        const isFriendlyMessage = dishExplanation.error.includes('🍽️') || 
                                 dishExplanation.error.includes('👨‍🍳');
        const isFinalError = dishExplanation.error.includes('😅'); // Final error message
        
        return (
            <div className="space-y-2">
                <div className={`p-3 rounded-lg border-2 ${
                    isFriendlyMessage 
                        ? 'bg-orange-50 border-orange-200 text-orange-800' 
                        : isFinalError
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    <div className="flex items-start space-x-2">
                        <span className="text-lg flex-shrink-0">
                            {isFriendlyMessage ? '🤖' : isFinalError ? '😅' : '❌'}
                        </span>
                        <div>
                            <p className="font-medium text-sm">
                                {dishExplanation.error}
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Show retry button for final errors AND non-friendly errors */}
                {(isFinalError || (!isFriendlyMessage && !isFinalError)) && (
                    <button
                        onClick={() => {
                            // Clear the error state and allow retry
                            setExplanations(prev => ({
                                ...prev,
                                [dish.name]: {
                                    ...prev[dish.name],
                                    [selectedLanguage]: undefined // Reset to allow retry
                                }
                            }));
                            // Then trigger new request
                            setTimeout(() => handleDishClick(dish.name), 100);
                        }}
                        className="text-sm px-3 py-1 bg-coral text-white rounded-full hover:bg-coral/80 transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        );
    }
    
    if (dishExplanation?.data) {
        return (
            <div className="space-y-4">
                <p className="font-medium text-lg">{dishExplanation.data.explanation}</p>
                
                {/* Tags Section */}
                {dishExplanation.data.tags && dishExplanation.data.tags.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-charcoal/70 uppercase tracking-wide">
                            {t.dietaryStyle}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {dishExplanation.data.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 text-xs font-bold bg-teal/20 text-teal-800 rounded-full border border-teal/30">{tag}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Allergens Section */}
                {dishExplanation.data.allergens && dishExplanation.data.allergens.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
                            ⚠️ {t.allergenInfo}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {dishExplanation.data.allergens.map(allergen => (
                                <span key={allergen} className="px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded-full border border-red-200">{allergen}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }
    
    return null;
};


    return (
        <div className="py-12 sm:py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* 1. PAGE TITLE - Large and prominent */}
                <h2 className="font-black text-5xl text-charcoal text-center mb-8 tracking-tighter">
                    {t.pageTitle}
                </h2>

                {/* 2. RESTAURANT INFO - Medium weight, attractive card */}
                {restaurantInfo && (restaurantInfo.name || restaurantInfo.cuisine) && (
                    <div className="bg-white border-4 border-charcoal rounded-2xl p-6 mb-6 shadow-[6px_6px_0px_#292524]">
                        <div className="text-center">
                            {restaurantInfo.name && (
                                <h3 className="font-black text-2xl text-coral mb-2">
                                    🏪 {restaurantInfo.name}
                                </h3>
                            )}
                            {restaurantInfo.cuisine && (
                                <p className="font-bold text-lg text-charcoal/80">
                                    🍽️ {restaurantInfo.cuisine} Cuisine
                                </p>
                            )}
                            {restaurantInfo.location && restaurantInfo.location.city && (
                                <p className="text-sm text-charcoal/60 font-medium">
                                    📍 {restaurantInfo.location.city}
                                    {restaurantInfo.location.state && `, ${restaurantInfo.location.state}`}
                                    {restaurantInfo.location.country && `, ${restaurantInfo.location.country}`}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. LANGUAGE FILTER - Clean grey pills, centered */}
                <div className="flex justify-center mb-6">
                    <div className="flex gap-2">
                        {languageOptions.map((option) => (
                            <button
                                key={option.code}
                                onClick={() => handleLanguageChange(option.code)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    selectedLanguage === option.code
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {option.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. ALLERGEN WARNING - Medium red warning box */}
                <div className="bg-red-50 border-4 border-red-200 rounded-2xl p-4 mb-8 shadow-sm">
                    <div className="flex items-start justify-center gap-3 text-red-700">
                        <span className="text-2xl mt-0.5">⚠️</span>
                        <span className="font-bold text-center leading-relaxed">
                            {t.allergenWarning}
                        </span>
                    </div>
                </div>

                {/* 5. MENU CONTENT - Desktop Table / Mobile Accordion */}
                <div className="bg-white rounded-2xl shadow-[8px_8px_0px_#292524] p-6 sm:p-8 border-4 border-charcoal space-y-10">
                    {menuSections.length > 0 ? (
                        menuSections.map((section, sectionIndex) => (
                            <div key={sectionIndex}>
                                {section.sectionTitle && (
                                    <h3 className="font-black text-3xl text-coral tracking-tight mb-4 border-b-4 border-charcoal pb-2">
                                        {section.sectionTitle}
                                    </h3>
                                )}
                                
                                {/* DESKTOP TABLE LAYOUT (≥768px) */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b-2 border-charcoal/50">
                                                <th className="p-4 text-lg font-bold text-charcoal w-1/2">{t.dishName}</th>
                                                <th className="p-4 text-lg font-bold text-charcoal w-1/2">{t.explanation}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {section.dishes.map((dish, dishIndex) => (
                                                <tr key={dishIndex} className="border-b-2 border-charcoal/10 last:border-b-0">
                                                    <td className="p-4 align-top">
                                                        <button 
                                                          onClick={() => handleDishClick(dish.name)}
                                                          className="text-xl font-medium text-charcoal tracking-tight text-left hover:text-coral transition-colors w-full disabled:hover:text-charcoal disabled:cursor-default"
                                                          aria-label={`Get explanation for ${dish.name}`}
                                                          disabled={!!explanations[dish.name]?.[selectedLanguage]?.isLoading}
                                                        >
                                                            {dish.name}
                                                        </button>
                                                    </td>
                                                    <td className="p-4 align-top text-charcoal/90">
                                                        {renderExplanationContent(dish)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* MOBILE ACCORDION LAYOUT (<768px) */}
                                <div className="md:hidden space-y-3">
                                    {section.dishes.map((dish, dishIndex) => {
                                        const isExpanded = expandedDishes.has(dish.name);
                                        const dishExplanation = explanations[dish.name]?.[selectedLanguage];
                                        const isLoading = dishExplanation?.isLoading;
                                        
                                        return (
                                            <div key={dishIndex} className="border-2 border-charcoal/20 rounded-xl overflow-hidden">
                                                {/* Accordion Header */}
                                                <button
                                                    onClick={() => handleMobileAccordionClick(dish.name)}
                                                    className="w-full p-4 text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
                                                    aria-expanded={isExpanded}
                                                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} explanation for ${dish.name}`}
                                                >
                                                    <div className="flex-1">
                                                        <span className="text-lg font-medium text-charcoal tracking-tight">
                                                            {dish.name}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4 flex-shrink-0">
                                                        <span className={`text-xl transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                                            ▼
                                                        </span>
                                                    </div>
                                                </button>
                                                
                                                {/* Accordion Content */}
                                                {isExpanded && (
                                                    <div className="p-4 bg-gray-50 border-t-2 border-charcoal/10 text-charcoal/90">
                                                        {renderExplanationContent(dish)}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-xl text-charcoal/70 font-medium">Could not find any dishes on the menu. Please try another image.</p>
                    )}
                </div>
            </div>
        </div>
    );
};




const ReviewsSection: React.FC = () => (
  <div className="py-12 sm:py-24 bg-teal border-y-4 border-charcoal">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="font-black text-5xl text-charcoal sm:text-6xl tracking-tighter">Early Reviews</h2>
        <p className="mt-4 text-xl text-charcoal/80">A lot of people are loving this app!</p>
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { text: "Tried it at a Korean BBQ place - worked pretty well! Got the gist of most dishes and avoided ordering something too spicy.", author: "Matt from Adelaide, Australia", shadowColor: "shadow-[8px_8px_0px_#FF6B6B]" },
          { text: "No more pointing at random menu items! I've used this a few times and find it especially useful when the servers are busy!", author: "Emma from Sydney, Australia", shadowColor: "shadow-[8px_8px_0px_#FFC700]" },
          { text: "Finally understood what I was eating in that hole-in-the-wall tapas bar. The ingredient breakdown was incredibly helpful.", author: "Rohit from Mumbai, India", shadowColor: "shadow-[8px_8px_0px_#4A90E2]" }
        ].map(review => (
          <div key={review.author} className={`bg-white p-6 rounded-2xl border-4 border-charcoal flex flex-col h-full ${review.shadowColor}`}>
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6 text-yellow" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.5 4.5a1 1 0 00.95.69h4.7c.969 0 1.371 1.24.588 1.81l-3.8 2.75a1 1 0 00-.364 1.118l1.5 4.5c.3.921-.755 1.688-1.54 1.118l-3.8-2.75a1 1 0 00-1.175 0l-3.8 2.75c-.784.57-1.838-.197-1.539-1.118l1.5-4.5a1 1 0 00-.364-1.118L2.06 9.927c-.783-.57-.38-1.81.588-1.81h4.7a1 1 0 00.95-.69l1.5-4.5z"/></svg>
              ))}
            </div>
            <p className="text-charcoal/90 text-lg flex-grow">"{review.text}"</p>
            <p className="mt-4 font-bold text-charcoal/60">- {review.author}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PricingTier: React.FC<{
  title: string;
  description: string;
  price: string;
  period: string;
  subtext: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
}> = ({ title, description, price, period, subtext, features, buttonText, isPopular }) => (
  <div className={`border-4 border-charcoal bg-white rounded-2xl p-8 flex flex-col h-full transition-transform duration-300 relative ${isPopular ? 'shadow-[12px_12px_0px_#FF6B6B] -rotate-2 hover:rotate-0' : 'shadow-[8px_8px_0px_#292524]'}`}>
    {isPopular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-yellow text-charcoal text-sm font-bold px-4 py-1 rounded-full border-2 border-charcoal uppercase">Most Popular</div>}
    <h3 className="text-3xl font-black text-charcoal tracking-tight">{title}</h3>
    <p className="mt-2 text-charcoal/70">{description}</p>
    <div className="mt-6">
      <span className="text-6xl font-black text-charcoal">{price}</span>
      <span className="text-xl font-bold text-charcoal/70"> {period}</span>
    </div>
    <p className={`mt-2 text-sm font-bold ${isPopular ? 'text-coral' : 'text-charcoal/60'}`}>{subtext}</p>
    <ul className="mt-8 space-y-3 text-charcoal/80 flex-grow">
      {features.map(feature => (
        <li key={feature} className="flex items-start">
          <svg className="w-7 h-7 text-teal mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
          <span className="font-medium">{feature}</span>
        </li>
      ))}
    </ul>
    <button className={`mt-8 w-full py-4 rounded-full font-bold border-4 border-charcoal shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all text-lg ${isPopular ? 'bg-coral text-white' : 'bg-yellow text-charcoal'}`}>{buttonText}</button>
  </div>
);

const PricingSection: React.FC = () => (
  <div className="py-12 sm:py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
        <PricingTier
          title="Try It Free"
          description="Perfect for testing the app and getting a taste of what it can do."
          price="$0"
          period="to start"
          subtext="You have 3 of 5 free scans remaining."
          features={["5 free menu scans", "Up to 5 dishes explained per scan", "All major languages", "No signup required", "Works on any device"]}
          buttonText="Get Started"
        />
        <PricingTier
          title="Daily Pass"
          description="Perfect for a day of exploring restaurants and trying new dishes."
          price="$1"
          period="for 1 day"
          subtext="Unlimited scans for 24 hours."
          features={["Unlimited menu scans for 24 hours", "All dishes explained on every menu", "All major languages", "Instant dish explanations", "No commitments"]}
          buttonText="Get Daily Pass"
        />
        <PricingTier
          title="Weekly Pass"
          description="Perfect for travelers and food explorers who scan multiple menus."
          price="$5"
          period="for 7 days"
          subtext="Unlimited scans for a week."
          features={["Unlimited menu scans for 7 days", "All dishes explained on every menu", "All major languages", "Priority processing", "Perfect for trips"]}
          buttonText="Get Weekly Pass"
          isPopular={true}
        />
      </div>
    </div>
  </div>
);

const HomePage: React.FC<HomePageProps> = ({ onScanSuccess }) => {
    const { user } = useAuth();
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<MenuSection[] | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [nonUserScans, setNonUserScans] = useState(3); // For non-logged in users
    const [restaurantInfo, setRestaurantInfo] = useState<{
        name: string; 
        cuisine: string; 
        location: any;
        id?: number;
    } | null>(null);

    // Fetch user profile when user logs in
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user) {
                try {
                    const { data, error } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (error) {
                        console.error('Error fetching user profile:', error);
                        return;
                    }

                    setUserProfile(data);
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            } else {
                setUserProfile(null);
            }
        };

        fetchUserProfile();
    }, [user]);

    // Check if user can scan
    const canScan = useCallback(() => {
        if (!user) {
            // Non-logged in users: check local state
            return nonUserScans < 5;
        }

        if (!userProfile) return false;

        // Check if subscription is active (for paid users)
        if (userProfile.subscription_type !== 'free') {
            const now = new Date();
            const expiresAt = userProfile.subscription_expires_at ? new Date(userProfile.subscription_expires_at) : null;
            
            if (expiresAt && now < expiresAt) {
                return true; // Active subscription
            }
        }

        // Free users (logged in or subscription expired): check scan limit
        return userProfile.scans_used < userProfile.scans_limit;
    }, [user, userProfile, nonUserScans]);

    const handleScanAttempt = () => {
        setShowLimitModal(true);
    };

    const handleResetScan = useCallback(() => {
        setScanResult(null);
        setScanError(null);
        setRestaurantInfo(null); // Reset restaurant info
    }, []);

    const handleScan = useCallback(async (base64Image: string) => {
        if (!canScan()) {
            handleScanAttempt();
            return;
        }

        const scanStartTime = Date.now();
        setIsScanning(true);
        setScanError(null);
        setScanResult(null);

        try {
            // Get user location first (non-blocking)
            const userLocation = await getUserLocation();
            console.log('User location:', userLocation);

            // Analyze menu with restaurant detection
            const menuAnalysis: MenuAnalysisResult = await analyzeMenu(base64Image);
            const scanTime = Date.now() - scanStartTime;
            
            console.log('Menu analysis result:', {
                restaurantName: menuAnalysis.restaurantName,
                detectedCuisine: menuAnalysis.detectedCuisine,
                sectionsCount: menuAnalysis.sections.length,
                dishesCount: menuAnalysis.sections.reduce((total, section) => total + section.dishes.length, 0)
            });

		// Find or create restaurant record
		let restaurantId = null;
		if (menuAnalysis.restaurantName) {
		    const totalDishCount = menuAnalysis.sections.reduce(
		        (total, section) => total + section.dishes.length, 
		        0
		    );
		    
		    restaurantId = await findOrCreateRestaurant(
		        menuAnalysis.restaurantName,
		        menuAnalysis.detectedCuisine || '',
		        userLocation,
		        totalDishCount // Pass the dish count
		    );
		    console.log(`Restaurant ID: ${restaurantId}, Dishes: ${totalDishCount}`);
		}

            // Track successful menu scan with restaurant info
            gtag('event', 'menu_scan_complete', {
                'scan_success': true,
                'processing_time_ms': scanTime,
                'dishes_detected': menuAnalysis.sections.reduce((total, section) => total + section.dishes.length, 0),
                'sections_detected': menuAnalysis.sections.length,
                'restaurant_name': menuAnalysis.restaurantName || 'unknown',
                'detected_cuisine': menuAnalysis.detectedCuisine || 'unknown',
                'location_city': userLocation.city || 'unknown',
                'location_country': userLocation.country || 'unknown'
            });

            setScanResult(menuAnalysis.sections);
            
            if (menuAnalysis.sections.length > 0) {
                // Store restaurant info with ID
                if (menuAnalysis.restaurantName || menuAnalysis.detectedCuisine) {
                    setRestaurantInfo({
                        name: menuAnalysis.restaurantName || '',
                        cuisine: menuAnalysis.detectedCuisine || '',
                        location: userLocation,
                        id: restaurantId || undefined // Store the restaurant ID
                    });
                }

                // Update scan count after successful scan
                if (user && userProfile?.subscription_type === 'free') {
                    await supabase
                        .from('user_profiles')
                        .update({ scans_used: userProfile.scans_used + 1 })
                        .eq('id', user.id);
                        
                    setUserProfile(prev => prev ? { ...prev, scans_used: prev.scans_used + 1 } : null);
                } else if (!user) {
                    setNonUserScans(prev => prev + 1);
                }
                
                await incrementMenuScanned();
                onScanSuccess();
            }
        } catch (err) {
            const scanTime = Date.now() - scanStartTime;
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            
            // Track failed menu scan
            gtag('event', 'menu_scan_complete', {
                'scan_success': false,
                'processing_time_ms': scanTime,
                'error_message': errorMessage,
                'dishes_detected': 0,
                'sections_detected': 0,
                'restaurant_name': 'error',
                'detected_cuisine': 'error'
            });
            
            console.error(err);
            setScanError(errorMessage);
        } finally {
            setIsScanning(false);
        }
    }, [canScan, user, userProfile, onScanSuccess]);

    const handleFileSelect = useCallback(async (file: File) => {
      // Track file upload method and details
      gtag('event', 'menu_upload_method', {
        'upload_type': 'file_upload',
        'file_type': file.type.split('/')[1] || 'unknown',
        'file_size_kb': Math.round(file.size / 1024),
        'image_width': 0, // We don't have dimensions yet
        'image_height': 0
      });

      const base64 = await fileToGenerativePart(file);
      handleScan(base64);
    }, [handleScan]);

    const handleBase64Select = useCallback((base64: string) => {
      handleScan(base64);
    }, [handleScan]);

    return (
        <div>
            {isScanning && (
                <div className="text-center py-28 flex flex-col items-center">
                    <div className="inline-block animate-spin rounded-full h-20 w-20 border-t-8 border-b-8 border-coral"></div>
                    <p className="mt-6 text-2xl text-charcoal font-bold">Analyzing your menu...</p>
                    <p className="text-lg text-charcoal/70">this might take a moment!</p>
                </div>
            )}

            {scanError && (
                 <div className="py-28 max-w-2xl mx-auto px-4">
                    <div className="bg-red-100 border-4 border-charcoal text-charcoal p-6 rounded-2xl relative shadow-[8px_8px_0px_#292524]" role="alert">
                      <strong className="font-black text-2xl block">Whoops! Scan Failed!</strong>
                      <span className="block mt-2">{scanError}</span>
                      <button onClick={() => setScanError(null)} className='absolute -top-3 -right-3 bg-coral rounded-full p-2 border-2 border-charcoal'>
                        <svg className="fill-current h-6 w-6 text-white" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                      </button>
                    </div>
                 </div>
            )}

            {!isScanning && !scanError && (
              scanResult 
                ? (
                    <>
                        <MenuResults 
                            menuSections={scanResult} 
                            restaurantInfo={restaurantInfo || undefined}
                        />
                        <div className="text-center pb-12 sm:pb-16">
                            <button
                                onClick={handleResetScan}
                                className="px-10 py-4 bg-coral text-white font-bold rounded-full border-4 border-charcoal shadow-[6px_6px_0px_#292524] hover:shadow-[8px_8px_0px_#292524] active:shadow-none active:translate-x-1.5 active:translate-y-1.5 transition-all text-xl"
                            >
                                Scan Another Menu!
                            </button>
                        </div>
                    </>
                  )
                : <HeroSection 
                    onImageSelect={handleFileSelect} 
                    onBase64Select={handleBase64Select}
                    canScan={canScan()}
                    onScanAttempt={handleScanAttempt}
                  />
            )}

            <ReviewsSection />
            <PricingSection />
            
            <ScanLimitModal 
                isOpen={showLimitModal}
                onClose={() => setShowLimitModal(false)}
                userProfile={userProfile}
                isLoggedIn={!!user}
            />
        </div>
    );
};

export default HomePage;