// src/components/menu/OrderDrawer.tsx
import React from 'react';
import { Plus, Minus, Trash2, MessageCircle, X } from 'lucide-react';
import { OrderItem, MenuItem, Language } from '../../types/menuTypes';

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: OrderItem[];
  menuItems: MenuItem[];
  language: Language;
  orderTotal: number;
  customRequestInput: Record<string, string>;
  selectedVariants: Record<string, string>;
  onUpdateQuantity: (dishId: string, delta: number, variantId?: string) => void;
  onRemoveFromOrder: (dishId: string, variantId?: string) => void;
  onUpdateVariant: (dishId: string, variantId: string) => void;
  onSetCustomRequestInput: (input: Record<string, string>) => void;
  onSetSelectedVariants: (variants: Record<string, string>) => void;
  onAddCustomRequest: (dishId: string, request: string) => void;
  onHandleServerResponse: (dishId: string, response: 'yes' | 'no' | 'checking') => void;
  onConfirmOrder: () => void;
}

const OrderDrawer: React.FC<OrderDrawerProps> = ({
  isOpen,
  onClose,
  orderItems,
  menuItems,
  language,
  orderTotal,
  customRequestInput,
  selectedVariants,
  onUpdateQuantity,
  onRemoveFromOrder,
  onUpdateVariant,
  onSetCustomRequestInput,
  onSetSelectedVariants,
  onAddCustomRequest,
  onHandleServerResponse,
  onConfirmOrder
}) => {
  const translations = {
    en: {
      yourOrder: 'Your Order',
      continueShopping: 'Continue',
      confirmOrder: 'Confirm Order',
      total: 'Total',
      addQuestion: 'Ask server a question...',
      showThisToServer: 'Show this to server',
      yes: 'Yes',
      no: 'No',
      letMeCheck: 'Let me check',
      chooseVariant: "Choose a variant",
    },
    zh: {
      yourOrder: '您的订单',
      continueShopping: '继续浏览',
      confirmOrder: '确认订单',
      total: '总计',
      addQuestion: '向服务员提问...',
      showThisToServer: '向服务员展示此内容',
      yes: '是',
      no: '否',
      letMeCheck: '让我确认',
      chooseVariant: "选择一个选项",
    },
    es: {
      yourOrder: 'Su Pedido',
      continueShopping: 'Continuar',
      confirmOrder: 'Confirmar',
      total: 'Total',
      addQuestion: 'Pregunta al mesero...',
      showThisToServer: 'Mostrar esto al mesero',
      yes: 'Sí',
      no: 'No',
      letMeCheck: 'Déjame verificar',
      chooseVariant: "Elige una variante",
    },
    fr: {
      yourOrder: 'Votre Commande',
      continueShopping: 'Continuer',
      confirmOrder: 'Confirmer',
      total: 'Total',
      addQuestion: 'Question au serveur...',
      showThisToServer: 'Montrer ceci au serveur',
      yes: 'Oui',
      no: 'Non',
      letMeCheck: 'Laisse-moi vérifier',
      chooseVariant: "Choisir une variante",
    }
  };

  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full max-h-[85vh] rounded-t-3xl flex flex-col animate-slide-up overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-wtm-text tracking-tight">{t.yourOrder}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close order"
            >
              <X size={24} className="text-wtm-muted" />
            </button>
          </div>

          {/* Scrollable order list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {orderItems.map(orderItem => {
              const menuItem = menuItems.find(item => item.id === orderItem.dishId);
              if (!menuItem) return null;

              const variant = menuItem.variants?.find(v => v.id === orderItem.variantId);
              const unitPrice = variant ? variant.price : menuItem.price;
              const lineTotal = unitPrice * orderItem.quantity;

              return (
                <div
                  key={`${orderItem.dishId}-${orderItem.variantId || "std"}`}
                  className="bg-gray-50 rounded-2xl p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-wtm-text">
                        {menuItem.name[language]}
                        {variant && (
                          <span className="text-sm text-gray-600"> ({variant.name})</span>
                        )}
                      </h3>
                      <p className="text-wtm-muted text-sm">
                        ${unitPrice.toFixed(2)} each
                      </p>
                    </div>
                    <div className="text-lg font-bold text-wtm-primary">
                      ${lineTotal.toFixed(2)}
                    </div>
                  </div>

                  {/* Variant Selector */}
                  {menuItem.variants && menuItem.variants.length > 0 && (
                    <div className="mt-3 mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.chooseVariant}
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20"
                        value={selectedVariants[menuItem.id] || orderItem.variantId || ""}
                        onChange={(e) => {
                          const variantId = e.target.value;
                          onSetSelectedVariants({
                            ...selectedVariants,
                            [menuItem.id]: variantId,
                          });
                          onUpdateVariant(menuItem.id, variantId);
                        }}
                      >
                        <option value="">{t.chooseVariant}</option>
                        {menuItem.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} - ${v.price.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onUpdateQuantity(orderItem.dishId, -1, orderItem.variantId)}
                        className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-bold text-lg w-6 text-center">
                        {orderItem.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(orderItem.dishId, 1, orderItem.variantId)}
                        className="w-8 h-8 bg-wtm-primary text-white rounded-full flex items-center justify-center hover:bg-wtm-primary-600"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => onRemoveFromOrder(orderItem.dishId, orderItem.variantId)}
                      className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Custom Request & Server Response */}
                  {orderItem.customRequest ? (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                      <p className="text-blue-800 font-medium mb-3">
                        "{orderItem.customRequest}"
                      </p>
                      <div className="text-xs text-blue-600 mb-3 font-medium">
                        {t.showThisToServer}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => onHandleServerResponse(orderItem.dishId, "yes")}
                          className={`px-3 py-2 rounded-xl font-medium text-sm ${
                            orderItem.serverResponse === "yes"
                              ? "bg-green-600 text-white"
                              : orderItem.serverResponse && orderItem.serverResponse !== "checking"
                              ? "bg-gray-200 text-gray-500"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                          disabled={
                            orderItem.serverResponse &&
                            orderItem.serverResponse !== "checking" &&
                            orderItem.serverResponse !== "yes"
                          }
                        >
                          {t.yes}
                        </button>
                        <button
                          onClick={() => onHandleServerResponse(orderItem.dishId, "no")}
                          className={`px-3 py-2 rounded-xl font-medium text-sm ${
                            orderItem.serverResponse === "no"
                              ? "bg-red-600 text-white"
                              : orderItem.serverResponse && orderItem.serverResponse !== "checking"
                              ? "bg-gray-200 text-gray-500"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                          disabled={
                            orderItem.serverResponse &&
                            orderItem.serverResponse !== "checking" &&
                            orderItem.serverResponse !== "no"
                          }
                        >
                          {t.no}
                        </button>
                        <button
                          onClick={() => onHandleServerResponse(orderItem.dishId, "checking")}
                          className={`px-3 py-2 rounded-xl font-medium text-sm ${
                            orderItem.serverResponse === "checking"
                              ? "bg-yellow-600 text-white"
                              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          }`}
                        >
                          {t.letMeCheck}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={t.addQuestion}
                        value={customRequestInput[orderItem.dishId] || ""}
                        onChange={(e) =>
                          onSetCustomRequestInput({
                            ...customRequestInput,
                            [orderItem.dishId]: e.target.value,
                          })
                        }
                        maxLength={200}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-white focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none transition-all duration-200"
                      />
                      <button
                        onClick={() =>
                          onAddCustomRequest(orderItem.dishId, customRequestInput[orderItem.dishId] || "")
                        }
                        disabled={!customRequestInput[orderItem.dishId]?.trim()}
                        className="px-4 py-3 bg-wtm-primary text-white rounded-xl hover:bg-wtm-primary-600 transition-colors disabled:opacity-50"
                      >
                        <MessageCircle size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sticky footer */}
          <div className="sticky bottom-0 border-t border-gray-100 bg-white p-6 space-y-4 shadow-md">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>{t.total}:</span>
              <span className="text-wtm-primary">${orderTotal.toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 text-wtm-text rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                {t.continueShopping}
              </button>
              <button
                onClick={onConfirmOrder}
                disabled={orderItems.length === 0}
                className="flex-1 bg-wtm-primary text-white font-semibold px-4 py-3 rounded-xl hover:bg-wtm-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.confirmOrder}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDrawer;