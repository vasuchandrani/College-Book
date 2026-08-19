package com.collegebook.collegebookbackend.admin.controller;

import com.collegebook.collegebookbackend.ad.dto.AdResponseDto;
import com.collegebook.collegebookbackend.admin.dto.CreateAdRequest;
import com.collegebook.collegebookbackend.admin.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getAdminStats() {
        return ResponseEntity.ok(adminService.getAdminStats());
    }

    @PostMapping("/ads")
    public ResponseEntity<AdResponseDto> createAd(@Valid @RequestBody CreateAdRequest request) {
        return ResponseEntity.ok(adminService.createAd(request));
    }

    @DeleteMapping("/ads/{id}")
    public ResponseEntity<Void> deleteAd(@PathVariable("id") UUID adId) {
        adminService.deleteAd(adId);
        return ResponseEntity.noContent().build();
    }
}
