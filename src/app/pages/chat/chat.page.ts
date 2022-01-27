import { Component, OnInit, ViewChild } from '@angular/core';
import { ChattService } from '../../services/chatt.service';
import { ChatService } from '../../object-init/chat.service';
import { RoomService } from '../../services/room.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Room } from 'src/app/models/room.model';
import { ChatThread } from 'src/app/models/chat-thread.model';
import { UserService } from '../../services/user.service';
import { UsersService } from '../../object-init/users.service';
import { ChatMessage } from '../../models/chat-message.model';
import { IonDatetime, IonContent } from '@ionic/angular';
import { format, parseISO, formatDistance } from 'date-fns';
import { SearchFeedService } from '../../services/search-feed.service';
import { RoomSearch } from 'src/app/models/room-search.model';
import { take } from 'rxjs/operators';
import { Client } from 'src/app/models/client.model';
import { IonicComponentService } from '../../services/ionic-component.service';
import { Appointment } from 'src/app/models/appointment.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit{

  @ViewChild(IonDatetime, {static: true}) datetime: IonDatetime;
  @ViewChild(IonContent, {read: IonContent, static: false}) content: IonContent;
  user: Client;
  rooms: Room[] = [];
  thread: ChatThread;
  selected_rooms: number[] = [];
  initial_loading: boolean = true;
  new_message: ChatMessage;
  slideOption = {
    slidesPerView: 'auto',
    grabCursor: true
  };
  constructor(
    private chat_init_svc: ChatService,
    private chat_svc: ChattService,
    private room_svc: RoomService,
    private activated_route: ActivatedRoute,
    private router: Router,
    private user_svc: UserService,
    private user_init_svc: UsersService,
    private searchfeed_svc: SearchFeedService,
    private ionic_component_svc: IonicComponentService
  ) { 
    this.thread = this.chat_init_svc.defaultThread();
    this.user = this.user_init_svc.defaultUser();
    this.new_message = this.chat_init_svc.defaultMessage();
    
  }

  ionViewWillEnter(){
    this.content.scrollToBottom(300);
  }

  ngOnInit(){
    this.ionic_component_svc.presentLoading();
    if(this.activated_route.snapshot.paramMap.get("thread_id")){
      this.chat_svc.getThread(this.activated_route.snapshot.paramMap.get("thread_id"))
      .subscribe(thd =>{
        this.thread = this.chat_init_svc.copyThread(thd);
        this.user = this.user_init_svc.copyClient(this.thread.client);
        if(this.thread.thread_id == ""){
          this.thread.thread_id = this.activated_route.snapshot.paramMap.get("thread_id");
          this.chat_svc.updateThread(this.thread);
        }
        //Prepare the search results for the client's current search
        if(thd.client.current_job != "" && (this.rooms.length == 0)){
          this.searchfeed_svc.getSearch(this.thread.client.current_job)
          .pipe(take(1))
          .subscribe(sch =>{
            if(sch){
              this.prepareSearchResults(sch);
              this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
            }else{
              this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
            }
          }) 
        }else{
          this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
        }
      })
    }else if(this.activated_route.snapshot.paramMap.get("search_id")){
      this.searchfeed_svc.getSearch(this.activated_route.snapshot.paramMap.get("search_id"))
      .pipe(take(1))
      .subscribe(sch =>{
        this.prepareSearchResults(sch)
        //check if these two have a chat open already
        if(sch.agent.contacts.indexOf(sch.searcher.uid) != -1){
          let index = sch.agent.contacts.indexOf(sch.searcher.uid);
          this.chat_svc.getThread(sch.agent.thread_ids[index])
          .subscribe(thd =>{
            this.thread = this.chat_init_svc.copyThread(thd);
            if(this.user.uid == "") this.user = this.user_init_svc.copyClient(this.thread.client);
          })
          this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
        }else{
           //if they dont have a chat open, start one
          this.thread.agent = sch.agent;
          this.thread.client = sch.searcher;
          //generate initial message
          if(this.user.uid == "") this.user = this.user_init_svc.copyClient(this.thread.client);
          this.generateInitialMessage();
          this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
        }
      })
    }else if(this.activated_route.snapshot.paramMap.get("source")){
      let rooms = this.activated_route.snapshot.paramMap.get('rooms').split(',');
      let client_id = this.activated_route.snapshot.paramMap.get("client_id");
      let agent_id = this.activated_route.snapshot.paramMap.get("agent_id");

      this.getChatRoom(rooms[0]);
      
      this.user_svc.getUser(agent_id)
      .pipe(take(1))
      .subscribe(agt =>{
        this.thread.agent = this.user_init_svc.copyUser(agt);

        this.user_svc.getClient(client_id)
        .pipe(take(1))
        .subscribe(clt =>{
          this.thread.client = this.user_init_svc.copyClient(clt);
          if(this.user.uid == "") this.user = this.user_init_svc.copyClient(this.thread.client);
          if(this.thread.agent.contacts.indexOf(this.thread.client.uid) != -1){
            let index = this.thread.agent.contacts.indexOf(this.thread.client.uid);
            this.chat_svc.getThread(this.thread.agent.thread_ids[index])
            .subscribe(thd =>{
              this.thread = this.chat_init_svc.copyThread(thd);
            })
            this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
          }else{
             //if they dont have a chat open, start one
            //generate initial message
            this.generateInitialMessage();
            this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
          }
        })
      })
    }
  }

  gotoAppointment(appointment: Appointment){
    this.router.navigate(['/appointment', {'appointment_id': appointment.appointment_id}])
  }

  formatDate(value: string){
    return format(parseISO(value), 'PPPPp');
  }

  prepareSearchResults(search: RoomSearch){
    this.searchfeed_svc.getRoomSearchResults(search)
    .pipe(take(1))
    .subscribe(rms =>{
      this.rooms = rms;
      this.rooms.forEach(rm =>{
        this.selected_rooms.push(null); //initalize all rooms as not selected
      })
    })
  }

  getChatRoom(room_id: string){
    this.room_svc.getRoom(room_id)
    .pipe(take(1))
    .subscribe(rm =>{
      this.rooms.push(rm);
    })
  }

  goHome(){
    this.router.navigate(['/home']);
  }

  handleTyping(event){

  }


  timeAgo(date){
    return formatDistance(date, Date.now(), {addSuffix: true});
  }

  generateInitialMessage(){
    this.new_message.message = "Knock knock";
    this.send();
  }

  send(){
    this.new_message.time = Date.now();
    this.new_message.message_id = this.thread.chat_messages.length > 0 ? this.thread.chat_messages.length - 1: 0;
    this.new_message.from = this.thread.client.uid;
    this.thread.chat_messages.push(this.new_message);
    this.thread.last_message = this.new_message;
    this.thread.new_messages.push(this.new_message);
    this.thread.last_update = Date.now();
    //If thread is not empty, just update the thread else create a new thread on the database 
    if(this.thread.thread_id != ""){
      this.chat_svc.updateThread(this.thread);
    }else{
      this.chat_svc.createThread(this.thread)
      .then(td =>{
        this.thread.thread_id = td.id;

        //update contacts on agent
        this.thread.agent.contacts.push(this.thread.client.uid);
        this.thread.agent.thread_ids.push(this.thread.thread_id);

        //update contacts on client
        this.thread.client.contacts.push(this.thread.agent.uid);
        this.thread.client.thread_ids.push(this.thread.thread_id);

        //Update the thread
        this.chat_svc.updateThread(this.thread)
        .then(() =>{
          //Sync agent and client profiles
          this.user_svc.updateClient(this.thread.client);
          this.user_svc.updateUser(this.thread.agent);
          this.chat_svc.getThread(this.thread.thread_id)
          .subscribe(_thd =>{
            this.thread = this.chat_init_svc.copyThread(_thd);
          })
        })
        .catch(err =>{
          console.log(err);
        })
      })
      .catch(err =>{
        console.log(err);
      })
    }
    this.new_message = this.chat_init_svc.defaultMessage();
    this.resetSelectedRooms();
    this.content.scrollToBottom(300);
  }

  updateRoomPicLoaded(i){
    this.rooms[i].dp_loaded = true;
  }

  updateMessageRoomPicLoaded(i, j){
    this.thread.chat_messages[i].rooms[j].dp_loaded = true;
  }

  selectRoom(i){
    //selected_rooms[i] holds the index of rooms[i] in new_message.rooms array
    if(this.selected_rooms[i] == null){
      this.selected_rooms[i] = this.new_message.rooms.push(this.rooms[i]) - 1;
    }else{
      this.new_message.rooms.splice(this.selected_rooms[i]);
      this.selected_rooms[i] = null;
    }
  }

  generateSelectedRoomIds(){
    let room_arr = [];
    this.new_message.rooms.forEach(r =>{
      room_arr.push(r.room_id)
    })
    return room_arr;
  }

  resetSelectedRooms(){
    for(let i = 0; i < this.selected_rooms.length; i++){
      this.selected_rooms[i] = null;
    } 
  }

  msgHighlight(event, i){
    if(event.detail.checked){
      this.new_message.highlight = this.thread.chat_messages[i];
    }else{
      this.new_message.highlight = null;
    }
  }

  openRoom(room_id){
    this.router.navigate(['/room', {'room_id': room_id}]);
  }

}
