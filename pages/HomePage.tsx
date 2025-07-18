import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { analyzeMenu } from '../services/geminiService';
import { MenuSection, DishExplanation } from '../types';
import { CameraIcon, UploadIcon } from '../components/icons';

interface HomePageProps {
  onScanSuccess: () => void;
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

const HeroSection: React.FC<{ 
    onImageSelect: (file: File) => void; 
    onBase64Select: (base64: string) => void; 
}> = ({ onImageSelect, onBase64Select }) => {
    const [showCamera, setShowCamera] = useState(false);
    
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onImageSelect(acceptedFiles[0]);
        }
    }, [onImageSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
        multiple: false
    });

    const boxStyle = `w-full sm:w-auto flex-1 p-6 border-4 border-charcoal rounded-2xl cursor-pointer transition-all bg-white shadow-[8px_8px_0px_#292524] hover:shadow-[10px_10px_0px_#292524] hover:-translate-y-1`;

    return (
        <>
            {showCamera && <CameraModal onClose={() => setShowCamera(false)} onCapture={onBase64Select} />}
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
                    <button onClick={() => setShowCamera(true)} className={`${boxStyle} hover:shadow-[10px_10px_0px_#FF6B6B]`}>
                         <CameraIcon className="w-16 h-16 text-charcoal mb-2"/>
                        <p className="font-bold text-xl text-charcoal">Take a picture</p>
                        <p className="text-md text-charcoal/70">using your camera</p>
                    </button>
                </div>
            </div>
        </>
    );
};

const MenuResults: React.FC<{ menuSections: MenuSection[] }> = ({ menuSections }) => {
    const [explanations, setExplanations] = useState<Record<string, {
        data: DishExplanation | null;
        isLoading: boolean;
        error: string | null;
    }>>({});

    const handleDishClick = async (dishName: string) => {
        // Don't refetch if already loading or has data/error
        if (explanations[dishName]) return;

        setExplanations(prev => ({
            ...prev,
            [dishName]: { data: null, isLoading: true, error: null }
        }));

        try {
            const response = await fetch(`/.netlify/functions/getDishExplanation?dishName=${encodeURIComponent(dishName)}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({error: `Request failed with status ${response.status}`}));
                throw new Error(errorData.error || `Request failed`);
            }
            const data: DishExplanation = await response.json();
            
            
            setExplanations(prev => ({
                ...prev,
                [dishName]: { data, isLoading: false, error: null }
            }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch explanation.";
            setExplanations(prev => ({
                ...prev,
                [dishName]: { data: null, isLoading: false, error: errorMessage }
            }));
        }
    };

    return (
        <div className="py-12 sm:py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="font-black text-5xl text-charcoal text-center mb-4 tracking-tighter">Menu Explained</h2>
                <p className="text-center text-xl text-charcoal/80 font-medium mb-12">Tap on any dish name to get an explanation.</p>
                <div className="bg-white rounded-2xl shadow-[8px_8px_0px_#292524] p-6 sm:p-8 border-4 border-charcoal space-y-10">
                    {menuSections.length > 0 ? (
                        menuSections.map((section, sectionIndex) => (
                            <div key={sectionIndex}>
                                {section.sectionTitle && (
                                    <h3 className="font-black text-3xl text-coral tracking-tight mb-4 border-b-4 border-charcoal pb-2">{section.sectionTitle}</h3>
                                )}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b-2 border-charcoal/50">
                                                <th className="p-4 text-lg font-bold text-charcoal w-1/2">Dish Name</th>
                                                <th className="p-4 text-lg font-bold text-charcoal w-1/2">Explanation</th>
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
                                                          disabled={!!explanations[dish.name]?.isLoading}
                                                        >
                                                            {dish.name}
                                                        </button>
                                                    </td>
                                                    <td className="p-4 align-top text-charcoal/90">
                                                        {explanations[dish.name]?.isLoading && (
                                                            <div className="flex items-center space-x-2 font-medium">
                                                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-coral"></div>
                                                                <span>Explaining...</span>
                                                            </div>
                                                        )}
                                                        {explanations[dish.name]?.error && (
                                                            <p className="text-red-600 font-medium">Error: {explanations[dish.name]?.error}</p>
                                                        )}
                                                        {explanations[dish.name]?.data && (
                                                            <div className="space-y-4">
                                                                <p className="font-medium text-lg">{explanations[dish.name]?.data?.explanation}</p>
                                                                
                                                                {/* Tags Section */}
                                                                {explanations[dish.name]?.data?.tags && explanations[dish.name]?.data?.tags?.length > 0 && (
                                                                    <div className="space-y-2">
                                                                        <p className="text-sm font-bold text-charcoal/70 uppercase tracking-wide">Dietary & Style</p>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {explanations[dish.name]?.data?.tags?.map(tag => (
                                                                                <span key={tag} className="px-3 py-1 text-sm font-bold bg-teal/20 text-teal-800 rounded-full border border-teal/30">{tag}</span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Allergens Section */}
                                                                {explanations[dish.name]?.data?.allergens && explanations[dish.name]?.data?.allergens?.length > 0 && (
                                                                    <div className="space-y-2">
                                                                        <p className="text-sm font-bold text-red-700 uppercase tracking-wide">⚠️ Allergen Information</p>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {explanations[dish.name]?.data?.allergens?.map(allergen => (
                                                                                <span key={allergen} className="px-3 py-1 text-sm font-bold bg-red-100 text-red-800 rounded-full border border-red-200">{allergen}</span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
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
}

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
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<MenuSection[] | null>(null);

    const handleResetScan = useCallback(() => {
        setScanResult(null);
        setScanError(null);
    }, []);

    const handleScan = useCallback(async (base64Image: string) => {
        setIsScanning(true);
        setScanError(null);
        setScanResult(null);

        try {
            const menuSections = await analyzeMenu(base64Image);
            setScanResult(menuSections);
            if (menuSections.length > 0) {
              onScanSuccess();
            }
        } catch (err) {
            console.error(err);
            setScanError(err instanceof Error ? err.message : "An unexpected error occurred.");
        } finally {
            setIsScanning(false);
        }
    }, [onScanSuccess]);

    const handleFileSelect = useCallback(async (file: File) => {
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
                        <MenuResults menuSections={scanResult} />
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
                : <HeroSection onImageSelect={handleFileSelect} onBase64Select={handleBase64Select} />
            )}

            <ReviewsSection />
            <PricingSection />
        </div>
    );
};

export default HomePage;