package com.convergex.backend.payload;
public class MessageResponse {
    private String message;
    public MessageResponse(String m){message=m;}
    public String getMessage(){return message;} public void setMessage(String m){message=m;}
}