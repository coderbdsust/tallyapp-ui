import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/modules/auth/services/common.service';
import { UserprofileService } from 'src/app/modules/auth/services/userprofile.service';
import { UserProfile } from './profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {

  userProfile!: UserProfile;
  
  constructor(private userProfileService: UserprofileService, private commonService: CommonService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.userProfileService.getUserProfile().subscribe(
      (response) => {
        this.userProfile = response;
        console.log(this.userProfile);
      },
      (error) => {
        this.commonService.showToastErrorResponse(error);
      },
    );
  }
}
