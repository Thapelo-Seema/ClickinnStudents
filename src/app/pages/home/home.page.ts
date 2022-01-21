import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuController, ModalController, NavController } from '@ionic/angular';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { RoomService } from '../../services/room.service';
import { Observable, Subscription } from 'rxjs';
import { AccommodationSearchPage } from '../accommodation-search/accommodation-search.page';
import { BannerDetailsPage } from '../../pages/banner-details/banner-details.page';
import { RolesPage } from '../roles/roles.page';
import { IonicComponentService } from '../../services/ionic-component.service';
import { UsersService } from '../../object-init/users.service';
import { SearchFeedService } from '../../services/search-feed.service';

import {take} from 'rxjs/operators';
import { Client } from 'src/app/models/client.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  user: Client;
  //Slider configuration 
  slideOptsOne = {
    initialSlide: 0,
    //slidesPerView: 1,
    slidesPerView: 1,
    spaceBetween: 30,
    freeMode: true,
    autoplay: true
  };

  slideOption = {
    slidesPerView: 'auto',
    grabCursor: true
  };

  //slider config for banner
  bannerSlideOption = {
    slidesPerView: 'auto',
    grabCursor: true,
    autoplay: true,
  };
  
  // ******** for Cart ***********//
  cart = [];

  //********* Observable *********/
  categories: Observable<any[]>; //the different roles on the platform 
  recommended: any[] = [];  //recommended properties (reses/accommmodations/places)
  banners: any[] = [];  //informational banners at the top

  constructor(
    public room_svc: RoomService,
    public menuCtrl: MenuController,
    private activatedRoute: ActivatedRoute,
    private navController: NavController,
    private user_svc: UserService,
    private user_init_svc: UsersService,
    public router: Router,
    private ionicComponentService: IonicComponentService,
    private modalController: ModalController,
    private authService: AuthService,
    private searchfeed_svc: SearchFeedService
  ) {
    this.user = this.user_init_svc.defaultClient();
  }

  ngOnInit() {
    this.authService.getAuthenticatedUser()
    .pipe(take(1))
    .subscribe(usr =>{
      if(usr && usr.uid){
        this.user.uid = usr.uid;
        this.user_svc.getClient(this.user.uid)
        .pipe(take(1))
        .subscribe(u =>{
          if(u){
            this.user = this.user_init_svc.copyClient(u);
            if(this.user.current_job != ""){
              this.searchfeed_svc.getSearch(this.user.current_job)
              .pipe(take(1))
              .subscribe(sch =>{
                if( sch.agent && sch.agent.contacts.indexOf(this.user.uid) != -1){
                  let index = sch.agent.contacts.indexOf(this.user.uid);
                  let thread_id = sch.agent.thread_ids[index];
                  this.router.navigate(['/chat', {'thread_id': thread_id}])
                }else{
                  this.router.navigate(['/agent-scanning', {'search_id': sch.id}])
                }
              })
            }
          }else{
            this.user_svc.createClient(this.user);
          }
        })

        //Get banners and recommended places
        this.room_svc.getBanners()
        .subscribe(bns =>{
          this.banners = bns;
        })
        this.room_svc.getRecommended()
        .subscribe(rec =>{
          this.recommended = rec;
          //console.log(this.recommended);
        })

      }else{
        this.authService.signUpAnonymously().then(dat =>{
          this.user.uid = dat.user.uid;
          this.user_svc.createClient(this.user);
          //Get banners and recommended places
          this.room_svc.getBanners()
          .subscribe(bns =>{
            this.banners = bns;
          })
          this.room_svc.getRecommended()
          .subscribe(rec =>{
            this.recommended = rec;
            //console.log(this.recommended);
          })
        })
        .catch(err =>{
          console.log(err)
        })
      }
    })
    
  }

  
  toggleSideMenu() {
    this.menuCtrl.toggle(); //Add this method to your button click function
  }

  //Open accommodation search modal
  async openSearchModal(client_id) {
    console.log(client_id);
    console.log("open modal");
    const modal = await this.modalController.create({
      component: AccommodationSearchPage,
      cssClass: "small-modal",
      componentProps: {
        uid: client_id
      },
      showBackdrop: true
    });
    return await modal.present();
  }

  async openSpecialModal(id) {
    const modal = await this.modalController.create({
      component: BannerDetailsPage,
      componentProps: {
        specialId: id
      }
    });
    return await modal.present();
  }

  async openRoleModal(specialId) {
    console.log("openModal");
    const modal = await this.modalController.create({
      component: RolesPage,
      componentProps: {
        specialId: specialId
      }
    });
    return await modal.present();
  }


  openDetail(accommodationId) {
    this.router.navigate(['/room', {'room_id': accommodationId, 'uid': this.user.uid}]);
  }

  gotoSignin(){
    this.router.navigateByUrl('/signin');
  }

}