import { Component, OnInit } from '@angular/core';
import { RoomSearch } from '../../models/room-search.model';
import { RoomSearchService } from '../../object-init/room-search.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicComponentService } from '../../services/ionic-component.service';
import { SearchFeedService } from '../../services/search-feed.service';
import { Room } from 'src/app/models/room.model';
import { take, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
})
export class ResultsPage implements OnInit {

  rooms: Observable<Room[]>;
  search: RoomSearch;
  results: number = 0;
  i = 0;
  show_search: boolean = false;
  show_results: boolean = true;
  constructor(
    private ionic_component_svc: IonicComponentService,
    private activated_route: ActivatedRoute, 
    private router: Router, 
    private searchfeed_svc: SearchFeedService,
    private room_search_init_svc: RoomSearchService) { 
      this.search  = this.searchfeed_svc.defaultSearch();
    }

  ngOnInit(){
    
  }

  ionViewWillEnter(){
    this.ionic_component_svc.presentLoading();
    if(this.activated_route.snapshot.paramMap.get('search_id')){
      this.search.id = this.activated_route.snapshot.paramMap.get('search_id');
      this.searchfeed_svc.getSearch(this.search.id)
      .pipe(take(1))
      .subscribe(sch =>{
        if(sch){
          this.search = this.room_search_init_svc.copySearch(sch);
          this.ionic_component_svc.dismissLoading().catch(err => console.log(err))
          this.rooms  = this.searchfeed_svc.getPlacesForCampus(sch).pipe(tap(_rooms =>{
            this.results = _rooms.length;
            if(this.results == 0) this.show_results = false;
          }))
        }
      })
    }
  }

  gotoRoom(room: Room){
    this.router.navigate(['/room', {'room_id': room.room_id, 'client_id': this.search.searcher.uid}]);
  }

  urlEncodedMessge(): string{
    let msg: string = `Hi my name is ${this.search.searcher.firstname}, here is my search:.\n`;
    msg += "https://clickinn.co.za/results;search_id=" + this.search.id + ";client_id=" + this.search.searcher.uid;
    return encodeURI(msg);
  }

  //Send a follow up
  generateWhatsAppLink(): string{
    //this.submitAgentService();
    let msg: string = this.urlEncodedMessge();
    return `https://wa.me/+27671093186?text=${msg}`;
  }

  
  seeSearch(){
    this.i++
    if(this.i > 10){
      this.show_search = true;
      this.show_results = false;
    }
  }

  close(){
    this.i = 0;
    this.show_search = false;
    if(this.results > 0) this.show_results = true;
  }

}
