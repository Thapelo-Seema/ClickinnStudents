import { Component} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { RoomService } from '../../services/room.service';
import { IonicComponentService } from '../../services/ionic-component.service';
import { UsersService } from '../../object-init/users.service';
//import { PropertiesService } from '../../object-init/properties.service';
import { SearchFeedService } from '../../services/search-feed.service';
import { take } from 'rxjs/operators';
import { Client } from 'src/app/models/client.model';
//import { IonicStorageService } from '../../services/ionic-storage.service';
import { RoomSearch } from 'src/app/models/room-search.model';
//import { Room } from 'src/app/models/room.model';
//import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { MapsService } from '../../services/maps.service';
import { Observable } from 'rxjs';
import { RoomPreview } from 'src/app/models/room-preview.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  slideOption = {
    slidesPerView: 'auto',
    grabCursor: true,
    autoplay: true
  };

  slideOption2 = {
    slidesPerView: 'auto',
    grabCursor: true
  };

  //********* Observable *********/
  recommended: Observable<RoomPreview[]>;  //recommended properties (reses/accommmodations/places)
  banners: Observable<any[]>;  //informational banners at the top

  //*******Own varibales */
  present_search: boolean = false;
  user: Client;
  area_search: RoomSearch;
  client_subs: any;
  search_subs: any;

  constructor(
    public room_svc: RoomService,
    private activated_route: ActivatedRoute,
    //private properties_svc: PropertiesService,
    private user_svc: UserService,
    private user_init_svc: UsersService,
    public router: Router,
    private ionic_component_svc: IonicComponentService,
    private authService: AuthService,
    private searchfeed_svc: SearchFeedService,
    private maps_svc: MapsService,
    //private storage_svc: IonicStorageService
  ) {
    this.user = this.user_init_svc.defaultClient();
    //this.search = this.searchfeed_svc.defaultSearch();
    this.area_search = this.searchfeed_svc.defaultSearch();
  }

  ionViewWillEnter(){
    this.ionic_component_svc.presentLoading();
    this.authService.getAuthenticatedUser()
    .pipe(take(1))
    .subscribe(usr =>{
      //console.log(usr)
      if(usr && usr.uid){
        //console.log("user authenticated...");
        //This will run if we have an authenticated user
        this.user.uid = usr.uid;
        this.getHomePageResources();
        this.fetchExistingClient();
        this.ionic_component_svc.dismissLoading().catch(err => console.log(err))
      }else{
        //console.log("user not authenticated...");
        //This can run even if we have a cached user who is just not authenticated
        this.signUpAnonymously();
        this.ionic_component_svc.dismissLoading().catch(err => console.log(err))
      }
    })
  }

  ngOnDestroy(){
    if(this.client_subs){
      this.client_subs.unsubscribe();
    }
    if(this.search_subs){
      this.search_subs.unsubscribe();
    }
  }

  createAreaSearch(institution_and_campus: string){
    this.ionic_component_svc.presentLoading();
    this.area_search.institution_and_campus = institution_and_campus
    this.maps_svc.getPlaceFromAddress(this.area_search.institution_and_campus)
    .then(data =>{
      this.maps_svc.getSelectedPlace(data[0])
      .then(address =>{
        this.area_search.institution_address = address;
        this.area_search.completed = true;
        this.area_search.searcher = this.user_init_svc.copyClient(this.user);
        this.area_search.time = Date.now();
        this.searchfeed_svc.createSearchOnFeed(this.area_search)
        .then(ref =>{
          this.area_search.id = ref.id;
          this.searchfeed_svc.updateSearch(this.area_search)
          .then(() =>{
            this.ionic_component_svc.dismissLoading();
            this.router.navigate(['/results', {search_id: this.area_search.id, 
              client_id: this.area_search.searcher.uid, campus_search: institution_and_campus}])
          })
          .catch(err =>{
            this.ionic_component_svc.dismissLoading();
            this.ionic_component_svc.presentAlert(err.message);
          })
        })
        .catch(err =>{
          this.ionic_component_svc.dismissLoading();
          this.ionic_component_svc.presentAlert(err.message);
        })
      })
    })
  }

  //Authenticate on firebase but check also if there's a client saved offline and allow this client to use the authstate
  signUpAnonymously(){
    this.authService.signUpAnonymously().then(dat =>{
      console.log("User is now authenticated...");
      this.getHomePageResources();
      this.user.uid = dat.user.uid;
      this.user.user_type = "client";
      this.user_svc.createClient(this.user)
    })
    .catch(err =>{
      console.log(err)
    })
  }

  updateDisplayPicLoaded(){
    this.user.dp_loaded = true;
  }

  gotoProfile(){
    this.router.navigate(['/profile', {'client_id': this.user.uid}]);
  }

  fetchExistingClient(){ 
    console.log("Fetching existing client...", this.user.uid)
    this.client_subs = this.user_svc.getClient(this.user.uid)
    .subscribe((u) =>{
      if(u){
        //console.log("Got persisted client...", u)
        this.user = this.user_init_svc.copyClient(u);
      }else{
        //If the logged on user is not persited on the database
        //console.log("User loggeed on but does not exist on the database");
        this.user.user_type = "client";
      }
    })
  }

  //Get banners and recently modified places
  getHomePageResources(){
    this.banners = this.room_svc.getBanners();
    this.recommended = this.room_svc.getRecentlyModified();
  }

  //Open accommodation search modal
  openSearchModal(client_id) {
    this.ionic_component_svc.presentLoading();
    this.router.navigate(['/accommodation-search', {'uid': client_id}])
    this.ionic_component_svc.dismissLoading().catch(err => console.log(err))
  }

  async openSpecialModal(id) {
    //this.ionic_component_svc.presentLoading();
    this.router.navigate(['/banner-details', {'specialId': id}])
    //this.ionic_component_svc.dismissLoading().catch(err => console.log(err))
  }

  async openRoleModal(_role) {
    this.ionic_component_svc.presentLoading();
    this.router.navigate(['/roles', {'role': _role, 'uid': this.user.uid}])
    this.ionic_component_svc.dismissLoading().catch(err => console.log(err))
  }

  openDetail(accommodationId) {
    //this.ionic_component_svc.presentLoading();
    this.router.navigate(['/room', {'room_id': accommodationId, 'client_id': this.user.uid}])
    //this.ionic_component_svc.dismissLoading().catch(err => console.log(err))
  }

}