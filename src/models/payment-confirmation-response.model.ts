import { IUserProfile } from "./user-profile.model";

export interface PaymentConfirmationResponse{
    token:JwtToken;
    status:string;
    UserProfileDTO:IUserProfile;
}

export interface JwtToken{
    idToken:string;
}
