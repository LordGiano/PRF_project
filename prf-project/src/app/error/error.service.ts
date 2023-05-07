import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({ providedIn: "root" })
export class ErrorService {
  private errorListener = new Subject<string>();

  getErrorListener() {
    return this.errorListener.asObservable();
  }

  throwError(message: string) {
    this.errorListener.next(message);
  }

  handleError() {
    this.errorListener.next("null");
  }
}
