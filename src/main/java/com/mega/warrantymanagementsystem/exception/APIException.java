package com.mega.warrantymanagementsystem.exception;


import com.mega.warrantymanagementsystem.exception.exception.AuthenticationException;
import com.mega.warrantymanagementsystem.exception.exception.DuplicateResourceException;
import com.mega.warrantymanagementsystem.exception.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class APIException {

    //chạy mỗi khi dính lỗi

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity handleBadRequest(MethodArgumentNotValidException exception){
        String message = "";

        for(var fieldError: exception.getBindingResult().getFieldErrors()){
            message += fieldError.getField() + ": "+fieldError.getDefaultMessage()+"\n";
        }

        return ResponseEntity.badRequest().body(message);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity handleBadCredentialsException(BadCredentialsException exception){
        return ResponseEntity.status(401).body("Invalid username or password");
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity handleResourceNotFoundException(ResourceNotFoundException exception){
        return ResponseEntity.status(404).body(exception.getMessage());
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity handleDuplicateResourceException(DuplicateResourceException exception){
        return ResponseEntity.status(409).body(exception.getMessage());
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity handleAuthenticationException(AuthenticationException exception){
        return ResponseEntity.status(401).body(exception.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity handleIllegalArgumentException(IllegalArgumentException exception){
        return ResponseEntity.status(400).body(exception.getMessage());
    }

}
