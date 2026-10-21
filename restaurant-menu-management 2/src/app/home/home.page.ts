import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCheckbox,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonCol,
  IonNote,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  ingredients?: string;
  allergens?: string;
  price: number;
  available: boolean;
  preparationTime?: number | null;
  imageUrl?: string;
}

type MenuItemForm = Omit<MenuItem, 'id' | 'price'> & {
  id?: string;
  price: number | null;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCheckbox,
    IonContent,
    IonGrid,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonRow,
    IonCol,
    IonNote,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private readonly storageKey = 'restaurant-menu-items';

  menuItems: MenuItem[] = [];
  searchTerm = '';
  editingId: string | null = null;
  submitted = false;

  form: MenuItemForm = this.createEmptyForm();

  constructor(private readonly alertController: AlertController) {}

  ngOnInit(): void {
    this.loadMenuItems();
  }

  get filteredMenuItems(): MenuItem[] {
    const partialName = this.searchTerm.trim().toLowerCase();

    if (!partialName) {
      return this.menuItems;
    }

    return this.menuItems.filter((item) =>
      item.name.toLowerCase().includes(partialName)
    );
  }

  saveRecord(): void {
    this.submitted = true;

    if (!this.isFormValid()) {
      return;
    }

    const cleanedRecord: MenuItem = {
      id: this.editingId ?? this.generateUuid(),
      name: this.form.name.trim(),
      category: this.form.category.trim(),
      description: this.cleanOptionalText(this.form.description),
      ingredients: this.cleanOptionalText(this.form.ingredients),
      allergens: this.cleanOptionalText(this.form.allergens),
      price: Number(this.form.price),
      available: Boolean(this.form.available),
      preparationTime: this.cleanOptionalNumber(this.form.preparationTime),
      imageUrl: this.cleanOptionalText(this.form.imageUrl),
    };

    if (this.editingId) {
      this.menuItems = this.menuItems.map((item) =>
        item.id === this.editingId ? cleanedRecord : item
      );
    } else {
      this.menuItems = [cleanedRecord, ...this.menuItems];
    }

    this.saveMenuItems();
    this.resetForm();
  }

  editRecord(item: MenuItem): void {
    this.editingId = item.id;
    this.submitted = false;
    this.form = {
      id: item.id,
      name: item.name,
      category: item.category,
      description: item.description ?? '',
      ingredients: item.ingredients ?? '',
      allergens: item.allergens ?? '',
      price: item.price,
      available: item.available,
      preparationTime: item.preparationTime ?? null,
      imageUrl: item.imageUrl ?? '',
    };
  }

  async confirmDelete(item: MenuItem): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete record',
      message: `Remove "${item.name}" from the local archive?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.deleteRecord(item.id),
        },
      ],
    });

    await alert.present();
  }

  deleteRecord(id: string): void {
    this.menuItems = this.menuItems.filter((item) => item.id !== id);
    this.saveMenuItems();

    if (this.editingId === id) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.form = this.createEmptyForm();
    this.editingId = null;
    this.submitted = false;
  }

  private createEmptyForm(): MenuItemForm {
    return {
      name: '',
      category: '',
      description: '',
      ingredients: '',
      allergens: '',
      price: null,
      available: true,
      preparationTime: null,
      imageUrl: '',
    };
  }

  private isFormValid(): boolean {
    const hasName = this.form.name.trim().length > 0;
    const hasCategory = this.form.category.trim().length > 0;
    const hasValidPrice =
      this.form.price !== null && Number(this.form.price) >= 0;
    const hasAvailability = typeof this.form.available === 'boolean';

    return hasName && hasCategory && hasValidPrice && hasAvailability;
  }

  private loadMenuItems(): void {
    const savedData = localStorage.getItem(this.storageKey);

    if (!savedData) {
      this.menuItems = [];
      return;
    }

    try {
      const parsedData = JSON.parse(savedData) as MenuItem[];
      this.menuItems = Array.isArray(parsedData) ? parsedData : [];
    } catch {
      this.menuItems = [];
    }
  }

  private saveMenuItems(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.menuItems));
  }

  private generateUuid(): string {
    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  }

  private cleanOptionalText(value?: string): string | undefined {
    const cleanedValue = value?.trim();
    return cleanedValue ? cleanedValue : undefined;
  }

  private cleanOptionalNumber(value?: number | null): number | null {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return null;
    }

    return Number(value);
  }
}
