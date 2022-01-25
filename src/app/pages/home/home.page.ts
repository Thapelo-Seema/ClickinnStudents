import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, ModalController} from '@ionic/angular';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { RoomService } from '../../services/room.service';
import { Observable} from 'rxjs';
import { AccommodationSearchPage } from '../accommodation-search/accommodation-search.page';
import { BannerDetailsPage } from '../../pages/banner-details/banner-details.page';
import { RolesPage } from '../roles/roles.page';
import { IonicComponentService } from '../../services/ionic-component.service';
import { UsersService } from '../../object-init/users.service';
import { SearchFeedService } from '../../services/search-feed.service';

import {take} from 'rxjs/operators';
import { Client } from 'src/app/models/client.model';
import { IonicStorageService } from '../../services/ionic-storage.service';
import { RoomSearch } from 'src/app/models/room-search.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

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
    grabCursor: true,
    autoplay: true
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

  //*******Own varibales */
  present_search: boolean = false;
  user: Client;
  search: RoomSearch;

  constructor(
    public room_svc: RoomService,
    public menuCtrl: MenuController,
    private user_svc: UserService,
    private user_init_svc: UsersService,
    public router: Router,
    private ionic_component_svc: IonicComponentService,
    private modalController: ModalController,
    private authService: AuthService,
    private searchfeed_svc: SearchFeedService,
    private storage_svc: IonicStorageService
  ) {
    this.user = this.user_init_svc.defaultClient();
    this.search = this.searchfeed_svc.defaultSearch();
  }

  ngOnInit() {
    //Get authenticated user, if none, create one
    this.ionic_component_svc.presentLoading();
    this.authService.getAuthenticatedUser()
    .pipe(take(1))
    .subscribe(usr =>{
      if(usr && usr.uid){
        this.getHomePageResources();
        this.user.uid = usr.uid;
        this.fetchExistingClient();
      }else{
        this.authService.signUpAnonymously().then(dat =>{
          this.getHomePageResources();
          //check if we have a client saved offline
          this.storage_svc.getUID()
          .then(data =>{
            console.log(data)
            if(data){
              this.user.uid = data;
              this.fetchExistingClient();
            }else{
              this.user.uid = dat.user.uid;
              this.user.user_type = "client";
              this.user_svc.createClient(this.user);
              this.saveUserOffline();
              this.ionic_component_svc.dismissLoading()
              .catch(err => console.log(err))
            }
          })
        })
        .catch(err =>{
          this.ionic_component_svc.dismissLoading()
          .catch(err => console.log(err))
          console.log(err)
        })
      }
    })
  }

  fetchExistingClient(){
    console.log("fetching user...");
    this.storage_svc.getUID()
    .then(_uid =>{
      if(_uid) this.user.uid = _uid;
      this.user_svc.getClient(this.user.uid)
      .pipe(take(1))
      .subscribe((u) =>{
        if(u){
          console.log(u)
          this.user = this.user_init_svc.copyClient(u);
          this.saveUserOffline() //TO BE REMOVED: if no user record is present offline, save it
          this.saveUserType(); //If no user type was saved, save it
          this.ionic_component_svc.dismissLoading()
          .catch(err => console.log(err))
          if(this.user.current_job != ""){
            this.searchfeed_svc.getSearch(this.user.current_job)
            .pipe(take(1))
            .subscribe(sch =>{
              if(sch){
                this.present_search = true;
                this.search = this.searchfeed_svc.copySearch(sch)
              }
            })
          }
        }else{
          console.log("creating user...")
          this.user.user_type = "client";
          this.user_svc.createClient(this.user);
          this.ionic_component_svc.dismissLoading()
          .catch(err => console.log(err))
        }
      })
    })
    .catch(err => console.log(err))
  }

  saveUserOffline(){
    this.storage_svc.getUID()
    .then(val =>{
      if(!val) this.storage_svc.setUser(this.user);
    })
    .catch(err =>{
      console.log(err)
    })
  }

  saveUserType(){
    this.storage_svc.getUserType()
    .then(val =>{
      if(!val) this.storage_svc.setUserType()
    })
    .catch(err => console.log(err))
  }

  //Get banners and recently modified places
  getHomePageResources(){
    this.room_svc.getBanners()
    .subscribe(bns =>{
      this.banners = bns;
    })
    this.room_svc.getRecentlyModified()
    .subscribe(rec =>{
      this.recommended = rec;
    })
  }

  gotoSearch(sch: RoomSearch){
    if( sch.agent && sch.agent.contacts.indexOf(this.user.uid) != -1){
      let index = sch.agent.contacts.indexOf(this.user.uid);
      let thread_id = sch.agent.thread_ids[index];
      this.router.navigate(['/chat', {'thread_id': thread_id}])
    }else{
      this.router.navigate(['/agent-scanning', {'search_id': sch.id}])
    }
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

  async openRoleModal(_role) {
    const modal = await this.modalController.create({
      component: RolesPage,
      componentProps: {
        role: _role,
        uid: this.user.uid
      }
    });
    return await modal.present();
  }


  openDetail(accommodationId) {
    this.router.navigate(['/room', {'room_id': accommodationId, 'client_id': this.user.uid}]);
  }

  gotoSignin(){
    this.router.navigateByUrl('/signin');
  }

  gotoAppointments(){
    this.router.navigate(['/appointments', {'client_id': this.user.uid}])
  }

  gotoChats(){
    this.router.navigate(['/chats', {'client_id': this.user.uid}])
  }

}