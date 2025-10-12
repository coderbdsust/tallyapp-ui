import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DrawerConfig {
  title?: string;
  data?: any;
  onSubmit?: (data: any) => void;
  onClose?: () => void;
  size?: 'small' | 'medium' | 'large';
  showOverlay?: boolean;
  closeOnOverlayClick?: boolean;
}

export interface DrawerState {
  isOpen: boolean;
  config: DrawerConfig | null;
}

@Injectable({
  providedIn: 'root'
})
export class DrawerService {
  private drawerStateSubject = new BehaviorSubject<DrawerState>({
    isOpen: false,
    config: null
  });
  
  public drawerState$: Observable<DrawerState> = this.drawerStateSubject.asObservable();

  constructor() {}

  open(config: DrawerConfig = {}): void {
    const defaultConfig: DrawerConfig = {
      size: 'medium',
      showOverlay: true,
      closeOnOverlayClick: true,
      ...config
    };

    this.drawerStateSubject.next({
      isOpen: true,
      config: defaultConfig
    });
  }

  close(): void {
    const currentState = this.drawerStateSubject.value;
    
    this.drawerStateSubject.next({
      isOpen: false,
      config: null
    });
  }

  update(config: Partial<DrawerConfig>): void {
    const currentState = this.drawerStateSubject.value;
    if (currentState.config) {
      this.drawerStateSubject.next({
        ...currentState,
        config: {
          ...currentState.config,
          ...config
        }
      });
    }
  }

  isOpen(): boolean {
    return this.drawerStateSubject.value.isOpen;
  }

  getConfig(): DrawerConfig | null {
    return this.drawerStateSubject.value.config;
  }
}