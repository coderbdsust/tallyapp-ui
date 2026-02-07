// profile-view.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserprofileService } from 'src/app/core/services/userprofile.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { UserProfile } from 'src/app/core/models/profile.model';

interface TfaStatus {
  byEmail: boolean;
  byMobile: boolean;
  byAuthenticator: boolean;
}

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent
  ],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerAnimation', [
      transition(':enter', [
        query('.stagger-item', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ProfileViewComponent implements OnInit {
  userProfile: UserProfile | undefined;
  tfaStatus: TfaStatus | undefined;
  isLoading = true;
  showSkeleton = true;

  constructor(
    private userProfileService: UserprofileService,
    private commonService: CommonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    
    // Hide skeleton after animation
    setTimeout(() => {
      this.showSkeleton = false;
    }, 800);
  }

  loadUserProfile(): void {
    this.userProfileService.getUserProfile().subscribe({
      next: (userProfile) => {
        this.userProfile = userProfile;
        this.isLoading = false;
      },
      error: (error) => {
        this.commonService.showToastErrorResponse(error);
        this.isLoading = false;
      }
    });
  }

  navigateToEdit(): void {
    this.router.navigate(['/user/profile-edit']);
  }

  getSecurityScore(): number {
    if (!this.tfaStatus) return 0;
    
    let score = 0;
    if (this.tfaStatus.byEmail) score += 33;
    if (this.tfaStatus.byMobile) score += 33;
    if (this.tfaStatus.byAuthenticator) score += 34;
    
    return score;
  }

  getSecurityLevel(): string {
    const score = this.getSecurityScore();
    if (score >= 67) return 'High';
    if (score >= 34) return 'Medium';
    return 'Low';
  }

  getSecurityLevelColor(): string {
    const level = this.getSecurityLevel();
    switch (level) {
      case 'High': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getProfileCompleteness(): number {
    if (!this.userProfile) return 0;
    
    let completedFields = 0;
    const totalFields = 8;
    
    if (this.userProfile.username) completedFields++;
    if (this.userProfile.fullName) completedFields++;
    if (this.userProfile.email) completedFields++;
    if (this.userProfile.dateOfBirth) completedFields++;
    if (this.userProfile.gender) completedFields++;
    if (this.userProfile.mobileNo) completedFields++;
    if (this.userProfile.addressList && this.userProfile.addressList.length > 0) completedFields++;
    if (this.userProfile.shortProfileList && this.userProfile.shortProfileList.length > 0) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  }

  getAllSkills(): string[] {
    if (!this.userProfile?.shortProfileList) return [];
    
    const allSkills: string[] = [];
    
    this.userProfile.shortProfileList.forEach(profile => {
      if (profile.skills) {
        const skills = profile.skills.split(',').map(skill => skill.trim());
        allSkills.push(...skills);
      }
    });
    
    // Remove duplicates and return unique skills
    return [...new Set(allSkills)].filter(skill => skill.length > 0);
  }
}