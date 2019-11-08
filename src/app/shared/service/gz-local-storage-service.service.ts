import { Injectable } from '@angular/core';
import { GzLocalStorage } from '../model/gz-local-storage';

@Injectable({
  providedIn: 'root',
})
export class GzLocalStorageServiceService {
  constructor() {}

  getItem(key: string): any {
    const data = localStorage.getItem(key);
    if (data != null) {
      const gzLocalStorage: GzLocalStorage = JSON.parse(data);
      if (new Date(gzLocalStorage.expiredDate) > new Date()) {
        // current value is not expired yet
        return gzLocalStorage.data;
      }
    }
    return null;
  }

  setItem(key: string, data: any, expiredDays: number = 7) {
    const storedData = {
      data,
      expiredDate: new Date().getTime() + 1000 * 3600 * 24 * expiredDays,
    };
    localStorage.setItem(key, JSON.stringify(storedData));
  }
}
