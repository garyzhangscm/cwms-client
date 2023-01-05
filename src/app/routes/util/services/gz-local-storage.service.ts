import { Injectable } from '@angular/core';

import { GzLocalStorage } from '../models/gz-local-storage';

@Injectable({
  providedIn: 'root'
})
export class GzLocalStorageService {
  constructor() {}

  getItem(key: string): any {
    const data = localStorage.getItem(key);
    if (data != null) {
      const gzLocalStorage: GzLocalStorage = JSON.parse(data);
      // console.log(`local storage of ${key}`);
      // console.log(`expired at ${new Date(gzLocalStorage.expiredDate)}`);
      // console.log(`current time: ${new Date()}`)
      // console.log(`expired? ${new Date(gzLocalStorage.expiredDate) <= new Date()}`)

      if (new Date(gzLocalStorage.expiredDate) > new Date()) {
        // current value is not expired yet
        return gzLocalStorage.data;
      }
    }
    return null;
  }

  setItem(key: string, data: any, expiredHours: number = 6): void {
    const storedData = {
      data,
      expiredDate: new Date().getTime() + 1000 * 3600 * expiredHours,
    };
    localStorage.setItem(key, JSON.stringify(storedData));
  }

  clear() : void {
    localStorage.clear();
  }

}
