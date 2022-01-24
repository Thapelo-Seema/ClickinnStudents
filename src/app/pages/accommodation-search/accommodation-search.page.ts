import { Component, OnInit } from '@angular/core';
import { RoomSearch } from '../../models/room-search.model';
import { SearchFeedService } from '../../services/search-feed.service';
import { MapsService } from '../../services/maps.service';
import { UserService } from '../../services/user.service';
import { UsersService } from '../../object-init/users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { ModalController} from '@ionic/angular';
import { IonicComponentService } from '../../services/ionic-component.service';

@Component({
  selector: 'app-accommodation-search',
  templateUrl: './accommodation-search.page.html',
  styleUrls: ['./accommodation-search.page.scss'],
})
export class AccommodationSearchPage implements OnInit {

  search: RoomSearch;
  uid: string = "";
  constructor(
    private searchfeed_svc: SearchFeedService,
    private maps_svc: MapsService,
    private ion_component_svc: IonicComponentService,
    private user_svc: UserService,
    private user_init_svc: UsersService,
    private modal_controller: ModalController,
    private activated_route: ActivatedRoute,
    private router: Router
    ) {
    this.search = this.searchfeed_svc.defaultSearch();
    this.search.max_price = null;
    this.search.searcher = this.user_init_svc.defaultClient();
    this.uid = this.activated_route.snapshot.paramMap.get("uid");
  }

  ngOnInit(){
    this.search.searcher.uid = this.uid;
    this.user_svc.getClient(this.uid)
    .pipe(take(1))
    .subscribe(usr =>{
      if(usr){
        this.search.searcher = this.user_init_svc.copyClient(usr);
        console.log(usr);
      }
    })
  }

  locationSelected(event){
    this.search.institution_and_campus = event.detail.value;
    this.maps_svc.getPlaceFromAddress(this.search.institution_and_campus)
    .then(data =>{
      this.maps_svc.getSelectedPlace(data[0])
      .then(address =>{
        this.search.institution_address = address;
      })
    })
  }

  submitSelfService(){
    this.ion_component_svc.presentLoading();
    this.search.time = Date.now();
    console.log("For self service");
    console.log(this.search)
    this.searchfeed_svc.createSearchOnFeed(this.search)
    .then(ref =>{
      this.search.id = ref.id;
      this.searchfeed_svc.updateSearch(this.search)
      .then(() =>{
        this.ion_component_svc.dismissLoading();
        this.close();
        this.search.searcher.current_job = this.search.id;
        this.user_svc.updateClient(this.search.searcher);
        this.router.navigate(['/results-scanning', {search_id: this.search.id}])
      })
      .catch(err =>{
        this.ion_component_svc.dismissLoading();
        this.ion_component_svc.presentAlert(err.message);
      })
    })
    .catch(err =>{
      this.ion_component_svc.dismissLoading();
      this.ion_component_svc.presentAlert(err.message);
    })
  }

  submitAgentService(){
    this.ion_component_svc.presentLoading();
    this.search.time = Date.now();
    console.log("For agent service");
    console.log(this.search)
    this.searchfeed_svc.createSearchOnFeed(this.search)
    .then(ref =>{
      this.search.id = ref.id;
      this.searchfeed_svc.updateSearch(this.search)
      .then(() =>{
        this.search.searcher.current_job = this.search.id;
        this.user_svc.updateClient(this.search.searcher);
        this.ion_component_svc.dismissLoading();
        this.close();
        this.router.navigate(['/agent-scanning', {search_id: this.search.id}])
      })
      .catch(err =>{
        this.ion_component_svc.dismissLoading();
        this.ion_component_svc.presentAlert(err.message);
      })
    })
    .catch(err =>{
      this.ion_component_svc.dismissLoading();
      this.ion_component_svc.presentAlert(err.message);
    })
  }

  async close(){
    await this.modal_controller.dismiss();
  }

}