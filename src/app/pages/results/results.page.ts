import { Component, OnInit } from '@angular/core';
import { RoomSearch } from '../../models/room-search.model';
import { RoomSearchService } from '../../object-init/room-search.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicComponentService } from '../../services/ionic-component.service';
import { SearchFeedService } from '../../services/search-feed.service';
import { Room } from 'src/app/models/room.model';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
})
export class ResultsPage implements OnInit {

  rooms: Room[] = [];
  search: RoomSearch;
  constructor(
    private ionic_component_svc: IonicComponentService,
    private activated_route: ActivatedRoute, 
    private router: Router, 
    private searchfeed_svc: SearchFeedService,
    private room_search_init_svc: RoomSearchService) { 
      this.search = this.room_search_init_svc.defaultRoomSearch();
    }

  ngOnInit(){

    if(this.activated_route.snapshot.paramMap.get('search_id')){
      this.search.id = this.activated_route.snapshot.paramMap.get('search_id');
      this.searchfeed_svc.getSearch(this.search.id)
      .pipe(take(1))
      .subscribe(sch =>{
        if(sch){
          this.search = this.room_search_init_svc.copySearch(sch);
          this.searchfeed_svc.getRoomSearchResults(sch)
          .pipe(take(1))
          .subscribe(rms =>{
            this.rooms = rms;
          })
        }
      })
    }
  }

  gotoRoom(room: Room){
    this.router.navigate(['/room', {'room_id': room.room_id, 'client_id': this.search.searcher.uid}]);
  }

}
