import React, { useState, useCallback, useRef, useEffect, type FC } from 'react';
import { useDropzone } from 'react-dropzone';
import { analyzeMenu } from '../services/geminiService';
import { MenuSection, DishExplanation, MenuAnalysisResult } from '../types';
import { CameraIcon, UploadIcon } from '../components/icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { LanguageSelector } from '../components/LanguageSelector';
import { restaurantService } from '../services/restaurantService';
import { LoginModal } from '../components/LoginModal';
import DemoSection from '../components/DemoSection';
import ShareWidget from '../components/ShareWidget';

import { 
  incrementUserMenuScan, 
  incrementUserDishExplanation, 
  resetUserDishCounter,
  getOrCreateEnhancedUserProfile,
  EnhancedUserProfile,
  getEnhancedUsageSummary 
} from '../services/enhancedUsageTracking';
import { 
  getUserCounters,
  canUserScan,
  canUserExplainDish
} from '../services/counterService';
import { 
  incrementAnonymousScan, 
  incrementAnonymousExplanation, 
  resetAnonymousDishCounter,
  canAnonymousUserScan,
  canAnonymousUserExplainDish 
} from '../services/anonymousUsageTracking';

// FIXED: Add missing getUserLocation function
const getUserLocation = async (): Promise<{
  city?: string;
  country?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
}> => {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const locationData = await response.json();
      return {
        city: locationData.city,
        country: locationData.country_name,
        state: locationData.region,
        latitude: locationData.latitude,
        longitude: locationData.longitude
      };
    }
  } catch (error) {
    console.warn('Could not get user location:', error);
  }
  return {};
};

// FIXED: Add missing findOrCreateRestaurant function
const findOrCreateRestaurant = async (
  name: string, 
  cuisine: string, 
  location: any, 
  dishCount: number
): Promise<number | null> => {
  try {
    console.log('Finding or creating restaurant:', { name, cuisine, location, dishCount });
    
    // Use the restaurant service if available
    if (restaurantService?.findOrCreateRestaurant) {
      return await restaurantService.findOrCreateRestaurant(name, cuisine, location, dishCount);
    }
    
    // Fallback: simple restaurant lookup/creation
    const { data: existingRestaurant, error: searchError } = await supabase
      .from('restaurants')
      .select('id')
      .ilike('name', name)
      .limit(1)
      .single();
    
    if (existingRestaurant) {
      return existingRestaurant.id;
    }
    
    if (searchError && searchError.code !== 'PGRST116') {
      console.error('Error searching for restaurant:', searchError);
      return null;
    }
    
    // Create new restaurant
    const { data: newRestaurant, error: createError } = await supabase
      .from('restaurants')
      .insert({
        name: name.trim(),
        cuisine: cuisine.trim(),
        location_data: location,
        total_dishes_scanned: dishCount,
        first_scanned_at: new Date().toISOString(),
        last_scanned_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (createError) {
      console.error('Error creating restaurant:', createError);
      return null;
    }
    
    return newRestaurant?.id || null;
  } catch (error) {
    console.error('Error in findOrCreateRestaurant:', error);
    return null;
  }
};

interface HomePageProps {
  onScanSuccess: () => void;
  onExplanationSuccess: () => void;
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

interface ScanLimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: EnhancedUserProfile | null;
    isLoggedIn: boolean;
    onPurchase: (planType: 'daily' | 'weekly') => void;
    onSignUp: () => void; // Add this prop for signup functionality
    loadingPlan: string | null;
}

const ScanLimitModal: React.FC<ScanLimitModalProps> = ({ 
    isOpen, 
    onClose, 
    userProfile, 
    isLoggedIn, 
    onPurchase, 
    onSignUp,
    loadingPlan 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-charcoal/80 flex items-center justify-center z-50 p-4">
            <div className="bg-cream rounded-2xl p-6 border-4 border-charcoal w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-charcoal hover:text-coral text-xl font-bold"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-black text-charcoal mb-4">Scan Limit Reached!</h2>
                
                {!isLoggedIn ? (
                    <div className="space-y-4">
                        <p className="text-charcoal/80">
                            You've used all 5 free scans. Choose a plan to continue scanning menus!
                        </p>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => onPurchase('daily')}
                                disabled={loadingPlan === 'daily'}
                                className="w-full py-3 bg-coral text-white font-bold rounded-lg border-2 border-charcoal hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loadingPlan === 'daily' ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    '🚀 Get Daily Pass - $1'
                                )}
                            </button>
                            
                            <button 
                                onClick={() => onPurchase('weekly')}
                                disabled={loadingPlan === 'weekly'}
                                className="w-full py-3 bg-yellow text-charcoal font-bold rounded-lg border-2 border-charcoal hover:bg-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loadingPlan === 'weekly' ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-charcoal mr-2"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    '⭐ Get Weekly Pass - $5 (Best Value!)'
                                )}
                            </button>
                        </div>

                        <div className="border-t-2 border-charcoal/20 pt-4 mt-4">
                            <p className="text-sm text-charcoal/70 text-center mb-3">
                                Or sign up to purchase a plan
                            </p>
                            <button
                                onClick={onSignUp}
                                className="w-full py-2 bg-gray-200 text-charcoal font-bold rounded-lg border-2 border-charcoal hover:bg-gray-300 transition-colors"
                            >
                                Purchase Plan
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-charcoal/80">
                            You've used all {userProfile?.scans_limit || 5} free scans. Upgrade to continue scanning menus!
                        </p>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => onPurchase('daily')}
                                disabled={loadingPlan === 'daily'}
                                className="w-full py-3 bg-coral text-white font-bold rounded-lg border-2 border-charcoal hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loadingPlan === 'daily' ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    '🚀 Get Daily Pass - $1'
                                )}
                            </button>
                            
                            <button 
                                onClick={() => onPurchase('weekly')}
                                disabled={loadingPlan === 'weekly'}
                                className="w-full py-3 bg-yellow text-charcoal font-bold rounded-lg border-2 border-charcoal hover:bg-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loadingPlan === 'weekly' ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-charcoal mr-2"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    '⭐ Get Weekly Pass - $5 (Best Value!)'
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Benefits section */}
                <div className="mt-6 p-4 bg-white/50 rounded-lg border-2 border-charcoal/20">
                    <h3 className="font-bold text-charcoal mb-2">✨ What you get:</h3>
                    <ul className="text-sm text-charcoal/80 space-y-1">
                        <li>• Unlimited menu scans</li>
                        <li>• Unlimited dish explanations</li>
                        <li>• Priority Support</li>
                    </ul>
                </div>
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

    const boxStyle = `flex-1 p-6 border-4 border-charcoal rounded-2xl cursor-pointer transition-all bg-white shadow-[8px_8px_0px_#292524] hover:shadow-[10px_10px_0px_#292524] hover:-translate-y-1 ${!canScan ? 'opacity-75' : ''}`;

    return (
        <>
            {showCamera && <CameraModal onClose={() => setShowCamera(false)} onCapture={handleCameraCapture} />}
            <div className="text-center py-20 sm:py-28 px-4">
                <h1 className="font-black text-5xl sm:text-6xl lg:text-7xl text-charcoal tracking-tighter">
                    Confused by a menu?
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-xl text-charcoal/80 font-medium">
                    Upload a photo of the menu and tap any dish for instant explanations.
                </p>
                
                {/* Updated button layout - always side by side */}
                <div className="mt-12 max-w-2xl mx-auto flex gap-4">
                    <div {...getRootProps()} className={`${boxStyle} ${isDragActive ? 'bg-yellow shadow-[10px_10px_0px_#1DD1A1]' : 'bg-white'}`}>
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center text-center">
                            <UploadIcon className="w-12 h-12 sm:w-16 sm:h-16 text-charcoal mb-2"/>
                            <p className="font-bold text-lg sm:text-xl text-charcoal">Upload Menu</p>
                        </div>
                    </div>
                    
                    <button onClick={handleCameraClick} className={`${boxStyle} hover:shadow-[10px_10px_0px_#FF6B6B] flex flex-col items-center justify-center`}>
                         <CameraIcon className="w-12 h-12 sm:w-16 sm:h-16 text-charcoal mb-2"/>
                        <p className="font-bold text-lg sm:text-xl text-charcoal">Take Photo</p>
                    </button>
                </div>
                
                {/* Updated bottom text */}
                <p className="mt-8 text-lg text-charcoal/70 font-medium">
                    Getting started is easy — and your first 5 scans are free.
                </p>
                
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

// COMPLETE MenuResults component - Replace your entire MenuResults component with this
const MenuResults: React.FC<{ 
    menuSections: MenuSection[]; 
    restaurantInfo?: { 
        name: string; 
        cuisine: string; 
        location: any;
        id?: number;
    };
    onExplanationSuccess: () => void;
    userProfile: EnhancedUserProfile | null;
    user: any;
}> = ({ menuSections, restaurantInfo, onExplanationSuccess, userProfile, user }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [explanations, setExplanations] = useState<Record<string, Record<string, {
        data: DishExplanation | null;
        isLoading: boolean;
        error: string | null;
    }>>>({});
    const [expandedDishes, setExpandedDishes] = useState<Set<string>>(new Set());

    // Calculate if we have any explanations yet (for showing hints)
    const hasAnyExplanations = Object.keys(explanations).some(dishName => 
        explanations[dishName][selectedLanguage]?.data
    );

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

    // Dedicated retry function
    const handleRetryDish = (dishName: string) => {
        setExplanations(prev => ({
            ...prev,
            [dishName]: {
                ...prev[dishName],
                [selectedLanguage]: undefined
            }
        }));
        
        setTimeout(() => {
            handleDishClick(dishName);
        }, 50);
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
            serversBusy: "Oops! Too many hungry people asking about dishes! Give me a moment to catch up... 🍽️",
            stillTrying: "Still cooking up your answer... Almost there! 👨‍🍳",
            finalError: "Hmm, our kitchen is really backed up! Please try again in a minute! 😅",
            dishLimitReached: "You've reached the limit of 5 dish explanations for this menu. Scan a new menu or upgrade your plan!"
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
            serversBusy: "¡Ups! ¡Demasiada gente hambrienta preguntando sobre platos! Dame un momento para ponerme al día... 🍽️",
            stillTrying: "Todavía cocinando tu respuesta... ¡Casi listo! 👨‍🍳",
            finalError: "¡Hmm, nuestra cocina está muy ocupada! ¡Inténtalo de nuevo en un minuto! 😅",
            dishLimitReached: "¡Has alcanzado el límite de 5 explicaciones de platos para este menú. ¡Escanea un nuevo menú o mejora tu plan!"
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
            serversBusy: "哎呀！太多饿肚子的人在问菜品了！给我一点时间赶上... 🍽️",
            stillTrying: "还在为您烹饪答案...快好了！👨‍🍳",
            finalError: "嗯，我们的厨房真的很忙！请一分钟后再试！😅",
            dishLimitReached: "您已达到此菜单5道菜解释的限制。请扫描新菜单或升级您的计划！"
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
            serversBusy: "Oups ! Trop de gens affamés posent des questions sur les plats ! Donnez-moi un moment pour rattraper... 🍽️",
            stillTrying: "Je cuisine encore votre réponse... Presque là ! 👨‍🍳",
            finalError: "Hmm, notre cuisine est vraiment occupée ! Réessayez dans une minute ! 😅",
            dishLimitReached: "Vous avez atteint la limite de 5 explications de plats pour ce menu. Scannez un nouveau menu ou améliorez votre plan !"
        }
    };

    const t = translations[selectedLanguage as keyof typeof translations];

    // Language options
    const languageOptions = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'zh', name: '中文' },
        { code: 'fr', name: 'Français' },
    ];

    // FIXED: handleDishClick with proper counter checking
    const handleDishClick = async (dishName: string) => {
        if (!explanations[dishName]) {
            explanations[dishName] = {};
        }
        
        // Check for successful data OR currently loading
        const currentExplanation = explanations[dishName][selectedLanguage];
        if (currentExplanation?.data || currentExplanation?.isLoading) {
            return;
        }
        
        // Check if user can explain more dishes before making API call
        let canExplain;
        if (user) {
            try {
                const counters = await getUserCounters(user.id);
                canExplain = canUserExplainDish(counters); // ✅ FIXED: Pass counters object
            } catch (error) {
                console.error('Error checking user dish explanation capability:', error);
                canExplain = false;
            }
        } else {
            canExplain = canAnonymousUserExplainDish();
        }
        
        if (!canExplain) {
            // Get appropriate error message based on user type
            let errorMessage;
            if (user) {
                try {
                    const counters = await getUserCounters(user.id);
                    const hasUnlimited = counters.subscription_type !== 'free' && 
                        counters.subscription_status === 'active' &&
                        counters.subscription_expires_at &&
                        new Date() < new Date(counters.subscription_expires_at) &&
                        ['daily', 'weekly'].includes(counters.subscription_type.toLowerCase());
                    
                    if (hasUnlimited) {
                        errorMessage = "Error checking explanation limit. Please try again.";
                    } else {
                        errorMessage = t.dishLimitReached;
                    }
                } catch (error) {
                    errorMessage = "Error checking explanation limit. Please try again.";
                }
            } else {
                errorMessage = t.dishLimitReached;
            }
            
            setExplanations(prev => ({
                ...prev,
                [dishName]: {
                    ...prev[dishName],
                    [selectedLanguage]: { 
                        data: null, 
                        isLoading: false, 
                        error: errorMessage
                    }
                }
            }));
            return;
        }
        
        // Helper function to make the secure API request
        const makeRequest = async (): Promise<DishExplanation> => {
            const requestStartTime = Date.now();
            const requestId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            
            // Track explanation request start
            gtag('event', 'dish_explanation_started', {
                'request_id': requestId,
                'dish_name': dishName,
                'language': selectedLanguage,
                'user_type': user ? 'authenticated' : 'anonymous',
                'restaurant_name': restaurantInfo?.name || 'unknown',
                'timestamp': Date.now()
            });

            // Prepare request headers
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            // Add authorization header if user is logged in
            if (user) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.access_token) {
                    headers['Authorization'] = `Bearer ${session.access_token}`;
                }
            }

            // Prepare request body
            const requestBody = {
                dishName,
                language: selectedLanguage,
                ...(restaurantInfo?.id && { restaurantId: restaurantInfo.id.toString() }),
                ...(restaurantInfo?.name && { restaurantName: restaurantInfo.name })
            };

            const response = await fetch('/.netlify/functions/getDishExplanation', {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
            });
            
            // Calculate timing AFTER getting response
            const requestEndTime = Date.now();
            const totalTime = requestEndTime - requestStartTime;
            const backendTime = parseInt(response.headers.get('X-Processing-Time') || '0');
            
            if (!response.ok) {
                // Track failed explanation request
                gtag('event', 'dish_explanation_failed', {
                    'request_id': requestId,
                    'dish_name': dishName,
                    'language': selectedLanguage,
                    'total_time_ms': totalTime,
                    'total_time_seconds': Math.round(totalTime / 1000 * 100) / 100,
                    'backend_time_ms': backendTime,
                    'backend_time_seconds': Math.round(backendTime / 1000 * 100) / 100,
                    'error_status': response.status,
                    'error_type': response.status === 429 ? 'rate_limit' : 
                                 response.status === 401 ? 'auth_error' : 
                                 response.status === 403 ? 'permission_error' : 'other',
                    'user_type': user ? 'authenticated' : 'anonymous',
                    'restaurant_name': restaurantInfo?.name || 'unknown',
                    'timestamp': Date.now()
                });

                if (response.status === 429) {
                    throw new Error('RATE_LIMIT');
                } else if (response.status === 401) {
                    throw new Error('Authentication failed. Please try logging in again.');
                } else if (response.status === 403) {
                    throw new Error('Access denied. Please check your permissions.');
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
        const maxRetries = 2;
        const retryDelays = [3000, 5000];

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
                const requestEndTime = Date.now();
                const totalTime = requestEndTime - startTime;
                
                // Track successful explanation request (ONLY ONCE HERE)
                gtag('event', 'dish_explanation_success', {
                    'request_id': startTime + '-' + dishName, // Simplified request ID
                    'dish_name': dishName,
                    'language': selectedLanguage,
                    'total_time_ms': totalTime,
                    'total_time_seconds': Math.round(totalTime / 1000 * 100) / 100,
                    'user_type': user ? 'authenticated' : 'anonymous',
                    'restaurant_name': restaurantInfo?.name || 'unknown',
                    'restaurant_cuisine': restaurantInfo?.cuisine || 'unknown',
                    'retry_count': retryCount,
                    'timestamp': Date.now()
                });
                
                // Update user-specific counters
                try {
                    if (user) {
                        await incrementUserDishExplanation(user.id);
                    } else {
                        incrementAnonymousExplanation();
                    }
                    
                    onExplanationSuccess();
                } catch (error) {
                    console.error('Error updating explanation counter:', error);
                }
                
                setExplanations(prev => ({
                    ...prev,
                    [dishName]: {
                        ...prev[dishName],
                        [selectedLanguage]: { data, isLoading: false, error: null }
                    }
                }));

            } catch (err) {
                if (err instanceof Error && err.message === 'RATE_LIMIT' && retryCount < maxRetries) {
                    const isFirstRetry = retryCount === 0;
                    const message = isFirstRetry ? t.serversBusy : t.stillTrying;
                    
                    setExplanations(prev => ({
                        ...prev,
                        [dishName]: {
                            ...prev[dishName],
                            [selectedLanguage]: { data: null, isLoading: true, error: message }
                        }
                    }));

                    const delay = retryDelays[retryCount];
                    retryCount++;
                    
                    setTimeout(() => {
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
                    const loadTime = Date.now() - startTime;
                    let errorMessage = t.finalError;
                    
                    if (err instanceof Error && err.message !== 'RATE_LIMIT') {
                        errorMessage = err.message;
                    }
                    
                    // Track failed dish explanation (final failure)
                    gtag('event', 'dish_explanation_error', {
                        'dish_name': dishName,
                        'language': selectedLanguage,
                        'load_time_ms': loadTime,
                        'error_message': errorMessage,
                        'error_type': err instanceof Error && err.message === 'RATE_LIMIT' ? 'rate_limit_final' : 'other',
                        'restaurant_name': restaurantInfo?.name || 'unknown',
                        'restaurant_cuisine': restaurantInfo?.cuisine || 'unknown',
                        'retry_count': retryCount,
                        'user_type': user ? 'authenticated' : 'anonymous'
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

        attemptRequest();
    };

    // Handle mobile accordion click
    const handleMobileAccordionClick = (dishName: string) => {
        toggleDishExpansion(dishName);
        
        if (!expandedDishes.has(dishName) && !explanations[dishName]?.[selectedLanguage]) {
            handleDishClick(dishName);
        }
    };

    // Render explanation content
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
            const isFinalError = dishExplanation.error.includes('😅');
            const isLimitError = dishExplanation.error.includes('limit') || dishExplanation.error.includes('límite') || dishExplanation.error.includes('限制') || dishExplanation.error.includes('limite');
            return (
                <div className="space-y-2">
                    <div className={`p-3 rounded-lg border-2 ${
                        isLimitError ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                        isFriendlyMessage ? 'bg-orange-50 border-orange-200 text-orange-800' :
                        isFinalError ? 'bg-red-50 border-red-200 text-red-700' :
                        'bg-red-50 border-red-200 text-red-700'
                    }`}>
                        <div className="flex items-start space-x-2">
                            <span className="text-lg flex-shrink-0">
                                {isLimitError ? '⚠️' : isFriendlyMessage ? '🤖' : isFinalError ? '😅' : '❌'}
                            </span>
                            <div>
                                <p className="font-medium text-sm">
                                    {dishExplanation.error}
                                </p>
                            </div>
                        </div>
                    </div>
                    {!isLimitError && (isFinalError || (!isFriendlyMessage && !isFinalError)) && (
                        <button
                            onClick={() => handleRetryDish(dish.name)}
                            className="text-sm px-3 py-1 bg-coral text-white rounded-full hover:bg-coral/80 transition-colors font-medium"
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
                
                {/* Page title */}
                <h2 className="font-black text-5xl text-charcoal text-center mb-8 tracking-tighter">
                    {t.pageTitle}
                </h2>

                {/* Restaurant info */}
                {restaurantInfo && (restaurantInfo.name || restaurantInfo.cuisine) && (
                    <div className="bg-white border-4 border-charcoal rounded-2xl p-6 mb-6 shadow-[6px_6px_0px_#292524]">
                        <div className="text-center">
                            {restaurantInfo.name && (
                                <h3 className="font-black text-2xl text-coral mb-2">
                                    🪅 {restaurantInfo.name}
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

                {/* Language selector */}
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

                {/* Allergen warning */}
                <div className="bg-red-50 border-4 border-red-200 rounded-2xl p-4 mb-8 shadow-sm">
                    <div className="flex items-start justify-center gap-3 text-red-700">
                        <span className="text-2xl mt-0.5">⚠️</span>
                        <span className="font-bold text-center leading-relaxed">
                            {t.allergenWarning}
                        </span>
                    </div>
                </div>

                {/* Menu content */}
                <div className="bg-white rounded-2xl shadow-[8px_8px_0px_#292524] p-6 sm:p-8 border-4 border-charcoal space-y-10">
                    {menuSections.length > 0 ? (
                        menuSections.map((section, sectionIndex) => (
                            <div key={sectionIndex}>
                                {section.sectionTitle && (
                                    <h3 className="font-black text-3xl text-coral tracking-tight mb-4 border-b-4 border-charcoal pb-2">
                                        {section.sectionTitle}
                                    </h3>
                                )}
                                
                                {/* DESKTOP TABLE LAYOUT with animated hints */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b-2 border-charcoal/50">
                                                <th className="p-4 text-lg font-bold text-charcoal w-1/2">
                                                    {t.dishName}
                                                    {!hasAnyExplanations && (
                                                        <span className="text-sm font-normal text-coral ml-2 animate-pulse">
                                                            (tap on dish name to see explanation)
                                                        </span>
                                                    )}
                                                </th>
                                                <th className="p-4 text-lg font-bold text-charcoal w-1/2">{t.explanation}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {section.dishes.map((dish, dishIndex) => {
                                                const globalDishIndex = sectionIndex * 1000 + dishIndex;
                                                const isFirstDish = globalDishIndex === 0;
                                                const isLoading = !!explanations[dish.name]?.[selectedLanguage]?.isLoading;
                                                
                                                return (
                                                    <tr key={dishIndex} className="border-b-2 border-charcoal/10 last:border-b-0">
                                                        <td className="p-4 align-top">
                                                            {/* Enhanced dish name button with all animations */}
                                                            <div className="relative group">
                                                                <button 
                                                                    onClick={() => handleDishClick(dish.name)}
                                                                    disabled={isLoading}
                                                                    className={`text-xl font-medium text-charcoal tracking-tight text-left hover:text-coral transition-all duration-200 w-full disabled:hover:text-charcoal disabled:cursor-default relative ${
                                                                        !hasAnyExplanations && isFirstDish ? 'animate-pulse' : ''
                                                                    }`}
                                                                    aria-label={`Get explanation for ${dish.name}`}
                                                                >
                                                                    {dish.name}
                                                                    
                                                                    {/* Subtle hover background effect */}
                                                                    <div className="absolute inset-0 bg-coral/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10 -mx-2 -my-1"></div>
                                                                    
                                                                    {/* Pointing finger emoji (desktop hover only) */}
                                                                    <span className="absolute -right-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-coral text-lg pointer-events-none">
                                                                        👈
                                                                    </span>
                                                                </button>
                                                                
                                                                {/* Ripple effect on click */}
                                                                <div className="absolute inset-0 rounded-lg pointer-events-none -mx-2 -my-1">
                                                                    <div className="absolute inset-0 bg-coral/20 rounded-lg scale-0 group-active:scale-100 transition-transform duration-150"></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 align-top text-charcoal/90">
                                                            {renderExplanationContent(dish)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* MOBILE ACCORDION LAYOUT with hints */}
                                <div className="md:hidden space-y-3">
                                    {section.dishes.map((dish, dishIndex) => {
                                        const globalDishIndex = sectionIndex * 1000 + dishIndex;
                                        const isFirstDish = globalDishIndex === 0;
                                        const isExpanded = expandedDishes.has(dish.name);
                                        const dishExplanation = explanations[dish.name]?.[selectedLanguage];
                                        const isLoading = dishExplanation?.isLoading;
                                        return (
                                            <div key={dishIndex} className="border-2 border-charcoal/20 rounded-xl overflow-hidden">
                                                <button onClick={() => handleMobileAccordionClick(dish.name)} className="w-full p-4 text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between group" aria-expanded={isExpanded} >
                                                    <div className="flex-1">
                                                        <span className="text-lg font-medium text-charcoal tracking-tight group-hover:text-coral transition-colors">
                                                            {dish.name}
                                                        </span>
                                                        {/* Mobile hint for first dish */}
                                                        {!hasAnyExplanations && isFirstDish && (
                                                            <span className="block text-sm text-coral font-medium animate-pulse mt-1">
                                                                👆 Tap on dish name to see explanation
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="ml-4 flex-shrink-0 flex items-center">
                                                        {isLoading && (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-coral mr-2"></div>
                                                        )}
                                                        <span className={`text-xl transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}> ▼ </span>
                                                    </div>
                                                </button>
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
                        <p className="text-center text-xl text-charcoal/70 font-medium">
                            Could not find any dishes on the menu. Please try another image.
                        </p>
                    )}
                </div>
                {/* NEW: Share Widget */}
                <div className="mt-8">
                    <ShareWidget 
                        location="post-scan" 
                        size="large" 
                        orientation="vertical"
                        userType={user ? 'authenticated' : 'anonymous'}
                    />
                </div>
            </div>
        </div>
    );
}

interface PricingTierProps {
  title: string;
  description: string;
  price: string;
  period: string;
  subtext: string;
  features: string[];
  buttonText: string;
  onPurchase?: () => void;
  isLoading?: boolean;
  isPopular?: boolean;
  isFree?: boolean;
}

const PricingTier: React.FC<PricingTierProps> = ({ 
  title, 
  description, 
  price, 
  period, 
  subtext, 
  features, 
  buttonText, 
  onPurchase,
  isLoading = false,
  isPopular = false,
  isFree = false
}) => (
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
    <button 
      onClick={isFree ? () => window.scrollTo({ top: 0, behavior: 'smooth' }) : onPurchase}
      disabled={isLoading && !isFree}  // Only disable if loading AND not free
        className={`mt-8 w-full py-4 rounded-full font-bold border-4 border-charcoal shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed ${
          isFree ? 'bg-green-600 text-white hover:bg-green-700' : 
          'bg-blue-600 text-white hover:bg-blue-700'
        }`}
    >
      {isLoading && !isFree ? (  // Only show loading if not free
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-2"></div>
          Processing...
        </div>
      ) : (
        buttonText
      )}
    </button>
  </div>
);

interface PricingSectionProps {
  user?: any;
  loadingPlan: string | null;
  handlePurchase: (planType: 'daily' | 'weekly') => void;
}

// Update the PricingSection component in HomePage.tsx to have better anchor positioning

const PricingSection: React.FC<PricingSectionProps> = ({ user, loadingPlan, handlePurchase }) => {
  return (
    <div className="py-12 sm:py-24 relative">
      {/* Invisible anchor positioned above the heading */}
      <div id="pricing-section" className="absolute -top-20"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-black text-5xl text-charcoal sm:text-6xl tracking-tighter">Choose Your Plan</h2>
          <p className="mt-4 text-xl text-charcoal/80">Start with free scans, upgrade when you need more!</p>
        </div>
        
        {/* Desktop Layout: Fun Cards Side by Side */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-3 gap-8">
            
            {/* Try It Free Card */}
            <div className="bg-white border-4 border-charcoal rounded-2xl p-8 shadow-[8px_8px_0px_#292524] flex flex-col h-full">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-black text-charcoal tracking-tight">Try It Free</h3>
                <p className="text-charcoal/70 font-medium mt-2">Perfect for a quick test of all features.</p>
                <div className="text-6xl font-black text-charcoal mt-4">$0</div>
                <p className="text-sm font-bold text-charcoal/60 mt-2">5 Free Scans</p>
              </div>
              
              <div className="flex-grow space-y-3 mb-6">
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-charcoal">Menu Scans</span>
                  <span className="font-black text-charcoal">5 Total</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-charcoal">Dish Explanations</span>
                  <span className="font-bold text-charcoal/60">Limited</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-charcoal">Translate Menus</span>
                  <span className="text-xl text-teal">✓</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-charcoal">One-Time Purchase</span>
                  <span className="text-xl text-teal">✓</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-charcoal">Signup Required</span>
                  <span className="font-black text-teal">No</span>
                </div>
              </div>
              
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full py-4 bg-green-600 text-white font-bold rounded-full border-4 border-charcoal shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all hover:bg-green-700"
              >
                Get Started
              </button>
            </div>
            
            {/* Daily Explorer Card */}
            <div className="bg-white border-4 border-charcoal rounded-2xl p-8 shadow-[8px_8px_0px_#292524] flex flex-col h-full">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-black text-charcoal tracking-tight">Daily Explorer</h3>
                <p className="text-charcoal/70 font-medium mt-2">Your guide for your day trip</p>
                <div className="text-6xl font-black text-charcoal mt-4">$1</div>
                <p className="text-sm font-bold text-charcoal/60 mt-2">1 Day Access</p>
              </div>
              
              <div className="flex-grow space-y-3 mb-6">
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-charcoal">Menu Scans</span>
                  <span className="font-black text-charcoal">10 Scans</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-charcoal">Dish Explanations</span>
                  <span className="font-black text-teal">✓ Unlimited</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-charcoal">Translate Menus</span>
                  <span className="text-xl text-teal">✓</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-charcoal">Not a Subscription</span>
                  <span className="text-xl text-teal">✓</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-charcoal">Signup Required</span>
                  <span className="font-bold text-charcoal">Yes</span>
                </div>
              </div>
              
              <button 
                onClick={() => handlePurchase('daily')}
                disabled={loadingPlan === 'daily'}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-full border-4 border-charcoal shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingPlan === 'daily' ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Buy for Just $1'
                )}
              </button>
            </div>
            
            {/* Weekly Voyager Card */}
            <div className="bg-white border-4 border-charcoal rounded-2xl p-8 shadow-[12px_12px_0px_#FF6B6B] flex flex-col h-full relative -rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow text-charcoal text-sm font-black px-4 py-1 rounded-full border-2 border-charcoal uppercase">
                Most Popular
              </div>
              
              <div className="text-center mb-6 mt-4">
                <h3 className="text-3xl font-black text-charcoal tracking-tight">Weekly Voyager</h3>
                <p className="text-charcoal/70 font-medium mt-2">The best value.</p>
                <div className="text-6xl font-black text-charcoal mt-4">$5</div>
                <p className="text-sm font-bold text-charcoal/60 mt-2">7 Day Access</p>
              </div>
              
              <div className="flex-grow space-y-3 mb-6">
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-charcoal">Menu Scans</span>
                  <div className="text-right">
                    <span className="font-black text-charcoal">70 Scans</span>
                    <div className="text-xs text-charcoal/70 font-medium">(Less than 8¢ per scan)</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-charcoal">Dish Explanations</span>
                  <span className="font-black text-teal">✓ Unlimited</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-charcoal">Translate Menus</span>
                  <span className="text-xl text-teal">✓</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-charcoal">Not a Subscription</span>
                  <span className="text-xl text-teal">✓</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-charcoal">Signup Required</span>
                  <span className="font-bold text-charcoal">Yes</span>
                </div>
              </div>
              
              <button 
                onClick={() => handlePurchase('weekly')}
                disabled={loadingPlan === 'weekly'}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-full border-4 border-charcoal shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingPlan === 'weekly' ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Start Your Week - Just $5'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Layout: Stacked Cards */}
        <div className="lg:hidden space-y-6">
          
          {/* Try It Free Card */}
          <div className="bg-white border-4 border-charcoal rounded-2xl p-6 shadow-[8px_8px_0px_#292524]">
            <div className="text-center mb-6">
              <h3 className="text-3xl font-black text-charcoal tracking-tight">Try It Free</h3>
              <div className="text-5xl font-black text-charcoal mt-2">$0</div>
              <p className="text-charcoal/70 font-medium mt-2">Perfect for a quick test.</p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-2">
                <span className="font-bold text-charcoal">5 Total Menu Scans</span>
                <span className="text-xl">📱</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-bold text-charcoal">Limited Dish Explanations</span>
                <span className="text-xl">📋</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-bold text-charcoal">No Signup Required</span>
                <span className="text-xl text-teal">✓</span>
              </div>
            </div>
            
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full py-4 bg-green-600 text-white font-bold rounded-full border-4 border-charcoal shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all hover:bg-green-700"
            >
              Get Started
            </button>
          </div>
          
          {/* Daily Explorer Card */}
          <div className="bg-white border-4 border-charcoal rounded-2xl p-6 shadow-[8px_8px_0px_#292524]">
            <div className="text-center mb-6">
              <h3 className="text-3xl font-black text-charcoal tracking-tight">Daily Explorer</h3>
              <div className="text-5xl font-black text-charcoal mt-2">$1</div>
              <p className="text-charcoal/70 font-medium mt-2">Your guide for a full day of discovery.</p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-2">
                <span className="font-bold text-charcoal">10 Menu Scans</span>
                <span className="text-xl">📱</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-bold text-charcoal">Unlimited Dish Explanations</span>
                <span className="text-xl text-teal">✓</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-bold text-charcoal">Not a Subscription</span>
                <span className="text-xl text-teal">✓</span>
              </div>
            </div>
            
            <button 
              onClick={() => handlePurchase('daily')}
              disabled={loadingPlan === 'daily'}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-full border-4 border-charcoal shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingPlan === 'daily' ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Unlock Today for $1'
              )}
            </button>
          </div>
          
          {/* Weekly Voyager Card */}
          <div className="bg-white border-4 border-charcoal rounded-2xl p-6 shadow-[12px_12px_0px_#FF6B6B] relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow text-charcoal text-sm font-black px-4 py-1 rounded-full border-2 border-charcoal uppercase">
              Most Popular
            </div>
            
            <div className="text-center mb-6 mt-4">
              <h3 className="text-3xl font-black text-charcoal tracking-tight">Weekly Voyager</h3>
              <div className="text-5xl font-black text-charcoal mt-2">$5</div>
              <p className="text-charcoal/70 font-medium mt-2">The best value for your entire trip.</p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-2">
                <span className="font-bold text-charcoal">70 Menu Scans</span>
                <span className="text-xl">📱</span>
              </div>
              <div className="text-xs text-charcoal/70 font-medium text-center -mt-1 mb-2">(Less than 8¢ per scan)</div>
              <div className="flex items-center justify-between py-2">
                <span className="font-bold text-charcoal">Unlimited Dish Explanations</span>
                <span className="text-xl text-teal">✓</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-bold text-charcoal">Not a Subscription</span>
                <span className="text-xl text-teal">✓</span>
              </div>
            </div>
            
            <button 
              onClick={() => handlePurchase('weekly')}
              disabled={loadingPlan === 'weekly'}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-full border-4 border-charcoal shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingPlan === 'weekly' ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Start Your Week for $5'
              )}
            </button>
          </div>
        </div>
        
        {/* Footnote */}
        <div className="mt-8 text-center">
          <p className="text-sm text-charcoal/60 italic">
            *Cost per scan based on the Weekly Voyager plan's pricing of $5 for 70 menu scans.
          </p>
        </div>
        
        {/* Bottom Payment Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-charcoal/60">
            All Prices in USD • 💳 Secure payments powered by Stripe • 🔒 SSL encrypted • 📱 Works on all devices
          </p>
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

const HomePage: React.FC<HomePageProps> = ({ onScanSuccess, onExplanationSuccess }) => {
    const { user } = useAuth();
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<MenuSection[] | null>(null);
    const [userProfile, setUserProfile] = useState<EnhancedUserProfile | null>(null);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [restaurantInfo, setRestaurantInfo] = useState<{
        name: string; 
        cuisine: string; 
        location: any;
        id?: number;
    } | null>(null);
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [isScanAllowed, setIsScanAllowed] = useState(true);
    
    const handlePurchase = useCallback(async (planType: 'daily' | 'weekly') => {
      console.log('🔍 Starting purchase process...');
      console.log('🔍 User object:', user);
      console.log('🔍 User ID:', user?.id);
      console.log('🔍 Plan type:', planType);
      
      if (!user) {
        console.log('❌ No user found');
        alert('Please sign up or log in to purchase a plan.');
        return;
      }

      setLoadingPlan(planType);

      try {
        const priceId = planType === 'daily' 
             ? import.meta.env.VITE_STRIPE_DAILY_PRICE_ID
             : import.meta.env.VITE_STRIPE_WEEKLY_PRICE_ID;

        const requestBody = {
          priceId,
          userId: user.id,
          planType,
        };

        console.log('🔍 Sending request with:', requestBody);

        const response = await fetch('/.netlify/functions/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('🔍 Response status:', response.status);
        console.log('🔍 Response ok:', response.ok);

        const data = await response.json();
        console.log('🔍 Response data:', data);

        if (!response.ok) {
          console.log('❌ Response not ok, throwing error:', data.error);
          throw new Error(data.error || 'Failed to create checkout session');
        }

        console.log('✅ Success! Redirecting to:', data.url);
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } catch (error) {
        console.error('❌ Error creating checkout session:', error);
        alert(`Failed to start checkout: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
      } finally {
        setLoadingPlan(null);
      }
    }, [user]);

    const handleSignUpFromModal = () => {
        setShowLimitModal(false);
        setShowLoginModal(true);
    };

    // Check if user has active paid subscription - moved inside component
    const hasActivePaidSubscription = useCallback(() => {
        if (!user || !userProfile) return false;
        
        // Check if user has a paid subscription type
        if (userProfile.subscription_type === 'free') return false;
        
        // Check if subscription is active
        if (userProfile.subscription_status !== 'active') return false;
        
        // Check if subscription hasn't expired
        if (userProfile.subscription_expires_at) {
            const now = new Date();
            const expiresAt = new Date(userProfile.subscription_expires_at);
            return now < expiresAt;
        }
        
        return false;
    }, [user, userProfile]);

    // Fetch user profile when user logs in
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user) {
                try {
                    const profile = await getOrCreateEnhancedUserProfile(user.id, user.email || undefined);
                    setUserProfile(profile);
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            } else {
                setUserProfile(null);
            }
        };

        fetchUserProfile();
    }, [user]);

    // FIXED: checkCanScan with proper parameter passing
    const checkCanScan = useCallback(async () => {
        if (!user) {
            return canAnonymousUserScan();
        }
        try {
            const counters = await getUserCounters(user.id);
            return canUserScan(counters); // ✅ FIXED: Pass counters object instead of userId
        } catch (error) {
            console.error('Error checking scan capability:', error);
            return false;
        }
    }, [user]);

    useEffect(() => {
        const checkPermission = async () => {
            const permission = await checkCanScan();
            setIsScanAllowed(permission);
        };
        checkPermission();
    }, [user, checkCanScan, scanResult]);

    const handleScanAttempt = () => {
        setShowLimitModal(true);
    };

    const handleResetScan = useCallback(() => {
        setScanResult(null);
        setScanError(null);
        setRestaurantInfo(null); // Reset restaurant info
        window.scrollTo(0, 0);
    }, []);

    const handleScan = useCallback(async (base64Image: string) => {
        if (!isScanAllowed) {
            handleScanAttempt();
            return;
        }

        const scanStartTime = Date.now();
        const sessionId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        setIsScanning(true);
        setScanError(null);
        setScanResult(null);

        // Track scan start
        gtag('event', 'menu_scan_started', {
            'session_id': sessionId,
            'user_type': user ? 'authenticated' : 'anonymous',
            'image_size_kb': Math.round(base64Image.length * 0.75 / 1024),
            'timestamp': Date.now()
        });

        try {
            // Reset dish counter when starting new scan
            if (user) {
                await resetUserDishCounter(user.id);
                setUserProfile(prev => prev ? { 
                    ...prev, 
                    current_menu_dish_explanations: 0 
                } : null);
            } else {
                resetAnonymousDishCounter();
            }

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
                    totalDishCount
                );
                console.log(`Restaurant ID: ${restaurantId}, Dishes: ${totalDishCount}`);
            }

            // Enhanced tracking for successful menu scan
            gtag('event', 'menu_scan_complete', {
                'session_id': sessionId,
                'scan_success': true,
                'processing_time_ms': scanTime,
                'processing_time_seconds': Math.round(scanTime / 1000 * 100) / 100, // 2 decimal places
                'dishes_detected': menuAnalysis.sections.reduce((total, section) => total + section.dishes.length, 0),
                'sections_detected': menuAnalysis.sections.length,
                'restaurant_name': menuAnalysis.restaurantName || 'unknown',
                'detected_cuisine': menuAnalysis.detectedCuisine || 'unknown',
                'location_city': userLocation.city || 'unknown',
                'location_country': userLocation.country || 'unknown',
                'user_type': user ? 'authenticated' : 'anonymous',
                'image_size_kb': Math.round(base64Image.length * 0.75 / 1024),
                'timestamp': Date.now()
            });

            setScanResult(menuAnalysis.sections);
            
            if (menuAnalysis.sections.length > 0) {
                // Store restaurant info with ID
                if (menuAnalysis.restaurantName || menuAnalysis.detectedCuisine) {
                    setRestaurantInfo({
                        name: menuAnalysis.restaurantName || '',
                        cuisine: menuAnalysis.detectedCuisine || '',
                        location: userLocation,
                        id: restaurantId || undefined
                    });
                }

                // Update scan count after successful scan
                if (user) {
                    await incrementUserMenuScan(user.id);
                    setUserProfile(prev => prev ? { 
                        ...prev, 
                        scans_used: prev.scans_used + 1,
                        current_menu_dish_explanations: 0
                    } : null);
                } else {
                    incrementAnonymousScan();
                }
                
                onScanSuccess();
            }
        } catch (err) {
            const scanTime = Date.now() - scanStartTime;
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            
            // Enhanced tracking for failed menu scan
            gtag('event', 'menu_scan_complete', {
                'session_id': sessionId,
                'scan_success': false,
                'processing_time_ms': scanTime,
                'processing_time_seconds': Math.round(scanTime / 1000 * 100) / 100,
                'error_message': errorMessage,
                'error_type': errorMessage.includes('timeout') ? 'timeout' : 
                             errorMessage.includes('network') ? 'network' : 'other',
                'dishes_detected': 0,
                'sections_detected': 0,
                'restaurant_name': 'error',
                'detected_cuisine': 'error',
                'user_type': user ? 'authenticated' : 'anonymous',
                'image_size_kb': Math.round(base64Image.length * 0.75 / 1024),
                'timestamp': Date.now()
            });
            
            console.error(err);
            setScanError(errorMessage);
        } finally {
            setIsScanning(false);
        }
    }, [isScanAllowed, user, onScanSuccess]);

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

    // Add Page Visibility API for Drop-off Tracking - FIXED useEffect
    useEffect(() => {
        let scanningStartTime: number | null = null;
        
        // Track when scanning starts
        if (isScanning && !scanningStartTime) {
            scanningStartTime = Date.now();
        }
        
        // Track when scanning completes
        if (!isScanning && scanningStartTime) {
            scanningStartTime = null;
        }

        const handleVisibilityChange = () => {
            if (document.hidden) {
                // User left the page/tab
                if (isScanning && scanningStartTime) {
                    const timeSpent = Date.now() - scanningStartTime;
                    gtag('event', 'menu_scan_abandoned', {
                        'abandonment_type': 'page_hidden',
                        'time_spent_ms': timeSpent,
                        'time_spent_seconds': Math.round(timeSpent / 1000 * 100) / 100,
                        'user_type': user ? 'authenticated' : 'anonymous',
                        'timestamp': Date.now()
                    });
                }
            }
        };

        const handleBeforeUnload = () => {
            // User is leaving the page entirely
            if (isScanning && scanningStartTime) {
                const timeSpent = Date.now() - scanningStartTime;
                gtag('event', 'menu_scan_abandoned', {
                    'abandonment_type': 'page_unload',
                    'time_spent_ms': timeSpent,
                    'time_spent_seconds': Math.round(timeSpent / 1000 * 100) / 100,
                    'user_type': user ? 'authenticated' : 'anonymous',
                    'timestamp': Date.now()
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isScanning, user]); // ✅ FIXED: Only include necessary dependencies

    // Track how long users spend viewing menu results - FIXED useEffect
    useEffect(() => {
        if (scanResult && scanResult.length > 0) {
            const viewStartTime = Date.now();
            
            return () => {
                const viewTime = Date.now() - viewStartTime;
                gtag('event', 'menu_results_viewed', {
                    'view_time_ms': viewTime,
                    'view_time_seconds': Math.round(viewTime / 1000 * 100) / 100,
                    'dishes_count': scanResult.reduce((total, section) => total + section.dishes.length, 0),
                    'sections_count': scanResult.length,
                    'user_type': user ? 'authenticated' : 'anonymous',
                    'restaurant_name': restaurantInfo?.name || 'unknown',
                    'timestamp': Date.now()
                });
            };
        }
    }, [scanResult, restaurantInfo, user]); // ✅ FIXED: Only include necessary dependencies

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
            <div
              className="bg-red-100 border-4 border-charcoal text-charcoal p-6 rounded-2xl relative shadow-[8px_8px_0px_#292524]"
              role="alert"
            >
              <strong className="font-black text-2xl block">Whoops! Scan Failed!</strong>
              <span className="block mt-2">{scanError}</span>
              <button
                onClick={() => setScanError(null)}
                className="absolute -top-3 -right-3 bg-coral rounded-full p-2 border-2 border-charcoal"
              >
                <svg
                  className="fill-current h-6 w-6 text-white"
                  role="button"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <title>Close</title>
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {!isScanning && !scanError && (
          scanResult ? (
            <>
              <MenuResults
                menuSections={scanResult}
                restaurantInfo={restaurantInfo || undefined}
                onExplanationSuccess={onExplanationSuccess}
                userProfile={userProfile}
                user={user}
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
          ) : (
            <>
              {/* 1. Hero Section */}
              <HeroSection
                onImageSelect={handleFileSelect}
                onBase64Select={handleBase64Select}
                canScan={isScanAllowed}
                onScanAttempt={handleScanAttempt}
              />
              
                {/* Section Separator - No extra padding */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-charcoal-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <div className="bg-cream-50 px-6">
                      <div className="w-12 h-1 bg-gradient-to-r from-coral-400 to-teal-400 rounded-full"></div>
                    </div>
                  </div>
                </div>

              <DemoSection selectedLanguage="en" />
              
             {/* 3. Pricing Section */}
             {!hasActivePaidSubscription() && (
               <PricingSection
                 user={user}
                 loadingPlan={loadingPlan}
                 handlePurchase={handlePurchase}
               />
             )}
             
             {/* 4. Reviews Section */}
             <ReviewsSection />
           </>
         )
       )}

       <ScanLimitModal
         isOpen={showLimitModal}
         onClose={() => setShowLimitModal(false)}
         userProfile={userProfile}
         isLoggedIn={!!user}
         onPurchase={handlePurchase}
         onSignUp={handleSignUpFromModal}
         loadingPlan={loadingPlan}
       />

       <LoginModal
         isOpen={showLoginModal}
         onClose={() => setShowLoginModal(false)}
       />
     </div>
   );
};

export default HomePage;
                                    '🚀 Get Daily Pass - $1'
                                )}
                            </button>
                            
                            <button 
                                onClick={() => onPurchase('weekly')}
                                disabled={loadingPlan === 'weekly'}
                                className="w-full py-3 bg-yellow text-charcoal font-bold rounded-lg border-2 border-charcoal hover:bg-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loadingPlan === 'weekly' ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-charcoal mr-2"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    '⭐ Get Weekly Pass - $5 (Best Value!)'
                                )}
                            </button>
                        </div>

                        {/* Signup option for anonymous users */}
                        <div className="border-t-2 border-charcoal/20 pt-4 mt-4">
                            <p className="text-sm text-charcoal/70 text-center mb-3">
                                Or sign up to purchase a plan
                            </p>
                            <button
                                onClick={onSignUp}
                                className="w-full py-2 bg-gray-200 text-charcoal font-bold rounded-lg border-2 border-charcoal hover:bg-gray-300 transition-colors"
                            >
                                Purchase Plan
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-charcoal/80">
                            You've used all {userProfile?.scans_limit || 5} free scans. Upgrade to continue scanning menus!
                        </p>
                        
                        <div className="space-y-3">
                            <button
								onClick={() => onPurchase('daily')}
								disabled={loadingPlan === 'daily'}
								className="w-full py-3 bg-coral text-white font-bold rounded-lg border-2 border-charcoal hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{loadingPlan === 'daily' ? (
									<div className="flex items-center justify-center">
										<div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
										Processing...
									</div>
								) : (
									'🚀 Get Daily Pass - $1'
								)}
							</button>
                                