
export interface Dish {
  name: string;
}

export interface MenuSection {
  sectionTitle: string;
  dishes: Dish[];
}

export interface DishExplanation {
  explanation: string;
  tags?: string[];
}
