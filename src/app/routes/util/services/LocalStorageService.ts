import { Injectable } from '@angular/core'; 
import { CWMSLocalStorage } from '../models/cwms-local-storage';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  // Set a value in local storage
  setItem(key: string, data: any, expiredHours: number = 6): void {
    const storedData = {
      data,
      expiredDate: new Date().getTime() + 1000 * 3600 * expiredHours,
    };
    localStorage.setItem(key, JSON.stringify(storedData));
  }

  // Get a value from local storage
  getItem(key: string): any {
    const data = localStorage.getItem(key);
    if (data != null) {
      const localStorage: CWMSLocalStorage = JSON.parse(data);
      // console.log(`local storage of ${key}`);
      // console.log(`expired at ${new Date(gzLocalStorage.expiredDate)}`);
      // console.log(`current time: ${new Date()}`)
      // console.log(`expired? ${new Date(gzLocalStorage.expiredDate) <= new Date()}`)

      if (new Date(localStorage.expiredDate) > new Date()) {
        // current value is not expired yet
        return localStorage.data;
      }
    }
    return null;
  }

  // Remove a value from local storage
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  // Clear all items from local storage
  clear(): void {
    localStorage.clear();
  }
}