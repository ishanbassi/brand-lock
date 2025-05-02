import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Lead, NewLead } from "../../lead/lead.model";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class HomeService {
    constructor(
        private readonly http: HttpClient

    ){}

    saveLead(data:NewLead){
        return this.http.post(`${environment.BaseApiUrl}/api/extended/leads`, data)
    }
}