package com.arogyajal.model;

import com.google.cloud.firestore.annotation.DocumentId;
import com.google.cloud.firestore.annotation.ServerTimestamp;
import com.google.cloud.Timestamp;

/**
 * Represents a user in the ArogyaJal system.
 * Supports multiple roles: ASHA workers, Villagers, Officials, and Admins.
 */
public class User {
    
    @DocumentId
    private String id;
    
    private String username; // Unique username
    private String passwordHash; // BCrypt hashed password
    private String role; // ASHA, VILLAGER, OFFICIAL, ADMIN
    
    // Personal information
    private String fullName;
    private String phoneNumber; // Unique, used for login
    private String email;
    
    // Location information
    private String village;
    private String district;
    private String state;
    private String pincode;
    
    // Preferences
    private String language; // hi, en, ta, te, bn, mr, gu
    private Boolean notificationsEnabled;
    private Boolean smsEnabled;
    private Boolean emailEnabled;
    
    // Account status
    private Boolean isActive;
    private Boolean isVerified;
    private String verificationToken;
    
    // Timestamps
    @ServerTimestamp
    private Timestamp createdAt;
    
    @ServerTimestamp
    private Timestamp updatedAt;
    
    private Timestamp lastLogin;
    
    // ASHA-specific fields
    private String ashaId; // Official ASHA worker ID
    private String assignedArea; // Area of responsibility
    private Integer reportsSubmitted; // Count of reports submitted
    
    // Security
    private String resetToken;
    private Timestamp resetTokenExpiry;
    private Integer failedLoginAttempts;
    private Timestamp accountLockedUntil;
    
    // Constructors
    public User() {
    }
    
    public User(String id, String username, String passwordHash, String role, String fullName,
                String phoneNumber, String email, String village, String district, String state,
                String pincode, String language, Boolean notificationsEnabled, Boolean smsEnabled,
                Boolean emailEnabled, Boolean isActive, Boolean isVerified, String verificationToken,
                Timestamp createdAt, Timestamp updatedAt, Timestamp lastLogin, String ashaId,
                String assignedArea, Integer reportsSubmitted, String resetToken, 
                Timestamp resetTokenExpiry, Integer failedLoginAttempts, Timestamp accountLockedUntil) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.village = village;
        this.district = district;
        this.state = state;
        this.pincode = pincode;
        this.language = language;
        this.notificationsEnabled = notificationsEnabled;
        this.smsEnabled = smsEnabled;
        this.emailEnabled = emailEnabled;
        this.isActive = isActive;
        this.isVerified = isVerified;
        this.verificationToken = verificationToken;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lastLogin = lastLogin;
        this.ashaId = ashaId;
        this.assignedArea = assignedArea;
        this.reportsSubmitted = reportsSubmitted;
        this.resetToken = resetToken;
        this.resetTokenExpiry = resetTokenExpiry;
        this.failedLoginAttempts = failedLoginAttempts;
        this.accountLockedUntil = accountLockedUntil;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPasswordHash() {
        return passwordHash;
    }
    
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getVillage() {
        return village;
    }
    
    public void setVillage(String village) {
        this.village = village;
    }
    
    public String getDistrict() {
        return district;
    }
    
    public void setDistrict(String district) {
        this.district = district;
    }
    
    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
    }
    
    public String getPincode() {
        return pincode;
    }
    
    public void setPincode(String pincode) {
        this.pincode = pincode;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public void setLanguage(String language) {
        this.language = language;
    }
    
    public Boolean getNotificationsEnabled() {
        return notificationsEnabled;
    }
    
    public void setNotificationsEnabled(Boolean notificationsEnabled) {
        this.notificationsEnabled = notificationsEnabled;
    }
    
    public Boolean getSmsEnabled() {
        return smsEnabled;
    }
    
    public void setSmsEnabled(Boolean smsEnabled) {
        this.smsEnabled = smsEnabled;
    }
    
    public Boolean getEmailEnabled() {
        return emailEnabled;
    }
    
    public void setEmailEnabled(Boolean emailEnabled) {
        this.emailEnabled = emailEnabled;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Boolean getIsVerified() {
        return isVerified;
    }
    
    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }
    
    public String getVerificationToken() {
        return verificationToken;
    }
    
    public void setVerificationToken(String verificationToken) {
        this.verificationToken = verificationToken;
    }
    
    public Timestamp getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
    
    public Timestamp getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Timestamp getLastLogin() {
        return lastLogin;
    }
    
    public void setLastLogin(Timestamp lastLogin) {
        this.lastLogin = lastLogin;
    }
    
    public String getAshaId() {
        return ashaId;
    }
    
    public void setAshaId(String ashaId) {
        this.ashaId = ashaId;
    }
    
    public String getAssignedArea() {
        return assignedArea;
    }
    
    public void setAssignedArea(String assignedArea) {
        this.assignedArea = assignedArea;
    }
    
    public Integer getReportsSubmitted() {
        return reportsSubmitted;
    }
    
    public void setReportsSubmitted(Integer reportsSubmitted) {
        this.reportsSubmitted = reportsSubmitted;
    }
    
    public String getResetToken() {
        return resetToken;
    }
    
    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }
    
    public Timestamp getResetTokenExpiry() {
        return resetTokenExpiry;
    }
    
    public void setResetTokenExpiry(Timestamp resetTokenExpiry) {
        this.resetTokenExpiry = resetTokenExpiry;
    }
    
    public Integer getFailedLoginAttempts() {
        return failedLoginAttempts;
    }
    
    public void setFailedLoginAttempts(Integer failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }
    
    public Timestamp getAccountLockedUntil() {
        return accountLockedUntil;
    }
    
    public void setAccountLockedUntil(Timestamp accountLockedUntil) {
        this.accountLockedUntil = accountLockedUntil;
    }
    
    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", username='" + username + '\'' +
                ", role='" + role + '\'' +
                ", fullName='" + fullName + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", village='" + village + '\'' +
                ", district='" + district + '\'' +
                ", isActive=" + isActive +
                ", lastLogin=" + lastLogin +
                '}';
    }
    
    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private String id;
        private String username;
        private String passwordHash;
        private String role;
        private String fullName;
        private String phoneNumber;
        private String email;
        private String village;
        private String district;
        private String state;
        private String pincode;
        private String language = "hi"; // Default Hindi
        private Boolean notificationsEnabled = true;
        private Boolean smsEnabled = true;
        private Boolean emailEnabled = false;
        private Boolean isActive = true;
        private Boolean isVerified = false;
        private String verificationToken;
        private Timestamp createdAt = Timestamp.now();
        private Timestamp updatedAt = Timestamp.now();
        private Timestamp lastLogin;
        private String ashaId;
        private String assignedArea;
        private Integer reportsSubmitted = 0;
        private String resetToken;
        private Timestamp resetTokenExpiry;
        private Integer failedLoginAttempts = 0;
        private Timestamp accountLockedUntil;
        
        public Builder id(String id) {
            this.id = id;
            return this;
        }
        
        public Builder username(String username) {
            this.username = username;
            return this;
        }
        
        public Builder passwordHash(String passwordHash) {
            this.passwordHash = passwordHash;
            return this;
        }
        
        public Builder role(String role) {
            this.role = role;
            return this;
        }
        
        public Builder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }
        
        public Builder phoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
            return this;
        }
        
        public Builder email(String email) {
            this.email = email;
            return this;
        }
        
        public Builder village(String village) {
            this.village = village;
            return this;
        }
        
        public Builder district(String district) {
            this.district = district;
            return this;
        }
        
        public Builder state(String state) {
            this.state = state;
            return this;
        }
        
        public Builder pincode(String pincode) {
            this.pincode = pincode;
            return this;
        }
        
        public Builder language(String language) {
            this.language = language;
            return this;
        }
        
        public Builder notificationsEnabled(Boolean notificationsEnabled) {
            this.notificationsEnabled = notificationsEnabled;
            return this;
        }
        
        public Builder smsEnabled(Boolean smsEnabled) {
            this.smsEnabled = smsEnabled;
            return this;
        }
        
        public Builder emailEnabled(Boolean emailEnabled) {
            this.emailEnabled = emailEnabled;
            return this;
        }
        
        public Builder isActive(Boolean isActive) {
            this.isActive = isActive;
            return this;
        }
        
        public Builder isVerified(Boolean isVerified) {
            this.isVerified = isVerified;
            return this;
        }
        
        public Builder verificationToken(String verificationToken) {
            this.verificationToken = verificationToken;
            return this;
        }
        
        public Builder createdAt(Timestamp createdAt) {
            this.createdAt = createdAt;
            return this;
        }
        
        public Builder updatedAt(Timestamp updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }
        
        public Builder lastLogin(Timestamp lastLogin) {
            this.lastLogin = lastLogin;
            return this;
        }
        
        public Builder ashaId(String ashaId) {
            this.ashaId = ashaId;
            return this;
        }
        
        public Builder assignedArea(String assignedArea) {
            this.assignedArea = assignedArea;
            return this;
        }
        
        public Builder reportsSubmitted(Integer reportsSubmitted) {
            this.reportsSubmitted = reportsSubmitted;
            return this;
        }
        
        public Builder resetToken(String resetToken) {
            this.resetToken = resetToken;
            return this;
        }
        
        public Builder resetTokenExpiry(Timestamp resetTokenExpiry) {
            this.resetTokenExpiry = resetTokenExpiry;
            return this;
        }
        
        public Builder failedLoginAttempts(Integer failedLoginAttempts) {
            this.failedLoginAttempts = failedLoginAttempts;
            return this;
        }
        
        public Builder accountLockedUntil(Timestamp accountLockedUntil) {
            this.accountLockedUntil = accountLockedUntil;
            return this;
        }
        
        public User build() {
            User user = new User();
            user.setId(id);
            user.setUsername(username);
            user.setPasswordHash(passwordHash);
            user.setRole(role);
            user.setFullName(fullName);
            user.setPhoneNumber(phoneNumber);
            user.setEmail(email);
            user.setVillage(village);
            user.setDistrict(district);
            user.setState(state);
            user.setPincode(pincode);
            user.setLanguage(language);
            user.setNotificationsEnabled(notificationsEnabled);
            user.setSmsEnabled(smsEnabled);
            user.setEmailEnabled(emailEnabled);
            user.setIsActive(isActive);
            user.setIsVerified(isVerified);
            user.setVerificationToken(verificationToken);
            user.setCreatedAt(createdAt);
            user.setUpdatedAt(updatedAt);
            user.setLastLogin(lastLogin);
            user.setAshaId(ashaId);
            user.setAssignedArea(assignedArea);
            user.setReportsSubmitted(reportsSubmitted);
            user.setResetToken(resetToken);
            user.setResetTokenExpiry(resetTokenExpiry);
            user.setFailedLoginAttempts(failedLoginAttempts);
            user.setAccountLockedUntil(accountLockedUntil);
            return user;
        }
    }
}
