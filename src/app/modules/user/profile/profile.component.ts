import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/modules/auth/services/common.service';
import { UserprofileService } from 'src/app/modules/user/service/userprofile.service';
import { UserProfile } from './profile.model';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {

  userProfile: UserProfile | undefined;
  
  constructor(private userProfileService: UserprofileService, private commonService: CommonService) {}

  ngOnInit(): void {
    initFlowbite();
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.userProfileService.getUserProfile().subscribe(
      (response) => {
        this.userProfile = response;
      },
      (error) => {
        this.commonService.showToastErrorResponse(error);
      },
    );
  }
}
