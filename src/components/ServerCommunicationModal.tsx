import React, { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

type Language = 'en' | 'zh' | 'es' | 'fr';

interface CommunicationRequest {
  id: string;
  question: Record<string, string>;
  response?: 'yes' | 'no';
  timestamp?: Date;
}

interface ServerCommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const ServerCommunicationModal: React.FC<ServerCommunicationModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const [requests, setRequests] = useState<CommunicationRequest[]>([]);

  // Translations for the communication questions
  const translations = {
    en: {
      title: 'Ask Your Server',
      subtitle: 'Tap a question to ask your server',
      showToServer: 'SHOW TO SERVER',
      serverResponse: 'Server Response',
      yes: 'Yes',
      no: 'No',
      close: 'Close',
      clearAll: 'Clear All',
      questions: {
        bathroom: 'Where is the bathroom?',
        bill: 'Bring me the bill, please?',
        card: 'Can I pay by card/contactless?',
        split: 'Can I split the bill, please?',
        tapWater: 'Can I get tap water, please?',
        bottledWater: 'Can I get bottled water, please?',
        napkins: 'May I have napkins/cutlery, please?'
      }
    },
    zh: {
      title: '询问服务员',
      subtitle: '点击问题询问服务员',
      showToServer: '向服务员展示',
      serverResponse: '服务员回复',
      yes: '是',
      no: '否',
      close: '关闭',
      clearAll: '清除全部',
      questions: {
        bathroom: '洗手间在哪里？',
        bill: '请给我账单好吗？',
        card: '我可以刷卡/非接触支付吗？',
        split: '我可以分开付账吗？',
        tapWater: '我可以要自来水吗？',
        bottledWater: '我可以要瓶装水吗？',
        napkins: '我可以要餐巾纸/餐具吗？'
      }
    },
    es: {
      title: 'Pregunta al Mesero',
      subtitle: 'Toca una pregunta para preguntar al mesero',
      showToServer: 'MOSTRAR AL MESERO',
      serverResponse: 'Respuesta del Mesero',
      yes: 'Sí',
      no: 'No',
      close: 'Cerrar',
      clearAll: 'Limpiar Todo',
      questions: {
        bathroom: '¿Dónde está el baño?',
        bill: '¿Me trae la cuenta, por favor?',
        card: '¿Puedo pagar con tarjeta/sin contacto?',
        split: '¿Puedo dividir la cuenta, por favor?',
        tapWater: '¿Puedo tener agua del grifo, por favor?',
        bottledWater: '¿Puedo tener agua embotellada, por favor?',
        napkins: '¿Puedo tener servilletas/cubiertos, por favor?'
      }
    },
    fr: {
      title: 'Demander au Serveur',
      subtitle: 'Appuyez sur une question pour demander au serveur',
      showToServer: 'MONTRER AU SERVEUR',
      serverResponse: 'Réponse du Serveur',
      yes: 'Oui',
      no: 'Non',
      close: 'Fermer',
      clearAll: 'Tout Effacer',
      questions: {
        bathroom: 'Où sont les toilettes?',
        bill: 'Apportez-moi l\'addition, s\'il vous plaît?',
        card: 'Puis-je payer par carte/sans contact?',
        split: 'Puis-je diviser l\'addition, s\'il vous plaît?',
        tapWater: 'Puis-je avoir de l\'eau du robinet, s\'il vous plaît?',
        bottledWater: 'Puis-je avoir de l\'eau en bouteille, s\'il vous plaît?',
        napkins: 'Puis-je avoir des serviettes/couverts, s\'il vous plaît?'
      }
    }
  };

  const t = translations[language];

  const predefinedQuestions = [
    { id: 'bathroom', text: t.questions.bathroom },
    { id: 'bill', text: t.questions.bill },
    { id: 'card', text: t.questions.card },
    { id: 'split', text: t.questions.split },
    { id: 'tapWater', text: t.questions.tapWater },
    { id: 'bottledWater', text: t.questions.bottledWater },
    { id: 'napkins', text: t.questions.napkins }
  ];

  const addRequest = (questionId: string, questionText: string) => {
    const newRequest: CommunicationRequest = {
      id: `${questionId}-${Date.now()}`,
      question: { [language]: questionText },
      timestamp: new Date()
    };
    setRequests([...requests, newRequest]);
  };

  const handleServerResponse = (requestId: string, response: 'yes' | 'no') => {
    setRequests(requests.map(req =>
      req.id === requestId
        ? { ...req, response, timestamp: new Date() }
        : req
    ));
  };

  const clearAllRequests = () => {
    setRequests([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-wtm-text tracking-tight">{t.title}</h2>
            <p className="text-wtm-muted text-sm mt-1">{t.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={24} className="text-wtm-muted" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Predefined Questions */}
          <div>
            <div className="grid gap-3">
              {predefinedQuestions.map(question => (
                <button
                  key={question.id}
                  onClick={() => addRequest(question.id, question.text)}
                  className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 hover:border-wtm-primary/30"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle size={18} className="text-wtm-primary shrink-0" />
                    <span className="text-wtm-text font-medium">{question.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Requests */}
          {requests.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-wtm-text">Active Requests</h3>
                <button
                  onClick={clearAllRequests}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  {t.clearAll}
                </button>
              </div>
              
              <div className="space-y-4">
                {requests.map(request => (
                  <div
                    key={request.id}
                    className="bg-blue-50 border border-blue-200 rounded-xl p-4"
                  >
                    <div className="mb-3">
                      <p className="text-blue-800 font-medium mb-2">
                        "{request.question[language]}"
                      </p>
                      <div className="text-xs text-blue-600 font-medium bg-red-100 border border-red-300 rounded-lg p-2 text-center">
                        {t.showToServer}
                      </div>
                    </div>

                    {request.response ? (
                      <div className={`font-bold text-center py-2 px-4 rounded-lg ${
                        request.response === 'yes'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {request.response === 'yes' ? '✅' : '❌'} {t.serverResponse}: {
                          request.response === 'yes' ? t.yes : t.no
                        }
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleServerResponse(request.id, 'yes')}
                          className="flex-1 px-4 py-3 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl font-medium transition-colors"
                        >
                          {t.yes}
                        </button>
                        <button
                          onClick={() => handleServerResponse(request.id, 'no')}
                          className="flex-1 px-4 py-3 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl font-medium transition-colors"
                        >
                          {t.no}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-6">
          <button
            onClick={onClose}
            className="w-full bg-wtm-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-wtm-primary-600 transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServerCommunicationModal;