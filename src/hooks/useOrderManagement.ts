// src/hooks/useOrderManagement.ts
import { OrderItem, MenuItem } from '../types/menuTypes';

export const useOrderManagement = (
  orderItems: OrderItem[],
  setOrderItems: (items: OrderItem[]) => void,
  menuItems: MenuItem[],
  customRequestInput: Record<string, string>,
  setCustomRequestInput: (input: Record<string, string>) => void
) => {
  const addToOrder = (dishId: string, variantId?: string, qty: number = 1) => {
    const existingItem = orderItems.find(
      item => item.dishId === dishId && item.variantId === variantId
    );

    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.dishId === dishId && item.variantId === variantId
          ? { ...item, quantity: item.quantity + qty }
          : item
      ));
    } else {
      setOrderItems([
        ...orderItems,
        { dishId, variantId, quantity: qty }
      ]);
    }
  };

  const updateVariant = (dishId: string, variantId: string) => {
    setOrderItems(
      orderItems.map(item =>
        item.dishId === dishId
          ? { ...item, variantId }
          : item
      )
    );
  };

  const updateQuantity = (dishId: string, delta: number, variantId?: string) => {
    setOrderItems(
      orderItems
        .map(item =>
          item.dishId === dishId && item.variantId === variantId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeFromOrder = (dishId: string, variantId?: string) => {
    setOrderItems(
      orderItems.filter(item => !(item.dishId === dishId && item.variantId === variantId))
    );
  };

  const addCustomRequest = (dishId: string, request: string) => {
    setOrderItems(orderItems.map(item => 
      item.dishId === dishId 
        ? { ...item, customRequest: request }
        : item
    ));
    setCustomRequestInput({ ...customRequestInput, [dishId]: '' });
  };

  const handleServerResponse = (dishId: string, response: 'yes' | 'no' | 'checking') => {
    setOrderItems(orderItems.map(item => 
      item.dishId === dishId 
        ? { ...item, serverResponse: response, responseTimestamp: new Date() }
        : item
    ));
  };

  // Calculate order total
  const orderTotal = orderItems.reduce((total, orderItem) => {
    const menuItem = menuItems.find(item => item.id === orderItem.dishId);
    if (!menuItem) return total;
    const variant = menuItem.variants?.find(v => v.id === orderItem.variantId);
    const unitPrice = variant ? variant.price : menuItem.price;
    return total + unitPrice * orderItem.quantity;
  }, 0);

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    addToOrder,
    updateVariant,
    updateQuantity,
    removeFromOrder,
    addCustomRequest,
    handleServerResponse,
    orderTotal,
    totalItems,
  };
};