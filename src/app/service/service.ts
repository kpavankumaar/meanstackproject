import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';



@Injectable()
export class Service {

    authUrl = '/api/auth';
    isAuthenticated = false;
    redirectUrl: string;
    // @Output() authChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(private http: HttpClient) { }

    // private userAuthChanged(status: boolean) {
    //     // this.authChanged.emit(status); // Raise changed event
    // }

    login(userLogin): Observable<boolean> {
        return this.http.post<boolean>('/login', userLogin)
        .pipe(
            map((data)=>{
                if(data.token){
                    
                }else{

                }
            })
        )
    }

    logout(): Observable<boolean> {
        return this.http.post<boolean>(this.authUrl + '/logout', null)
            .pipe(
                map(loggedOut => {
                    this.isAuthenticated = !loggedOut;
                    this.userAuthChanged(!loggedOut); // Return loggedIn status
                    return loggedOut;
                }),
                catchError(this.handleError)
            );
    }

    private handleError(error: HttpErrorResponse) {
        console.error('server error:', error);
        if (error.error instanceof Error) {
            const errMessage = error.error.message;
            return Observable.throw(errMessage);
            // Use the following instead if using lite-server
            // return Observable.throw(err.text() || 'backend server error');
        }
        return Observable.throw(error || 'Server error');
    }

}
