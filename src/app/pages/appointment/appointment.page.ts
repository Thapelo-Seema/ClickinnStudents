import { Component, OnInit, ViewChild } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { Appointment } from '../../models/appointment.model';
import { AppointmentService } from '../../services/appointment.service';
import { IonicComponentService } from '../../services/ionic-component.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { take } from 'rxjs/operators';
import { UsersService } from '../../object-init/users.service';
import { RoomService } from '../../services/room.service';
import { IonDatetime} from '@ionic/angular';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.page.html',
  styleUrls: ['./appointment.page.scss'],
})
export class AppointmentPage implements OnInit {

  @ViewChild(IonDatetime, {static: true}) datetime: IonDatetime;
  appointment: Appointment = {
    location: null,
    agent: null,
    appointment_id: "",
    client: null,
    client_cancels: false,
    date: null,
    landlord_confirmations: [],
    landlord_declines: [],
    rooms: [],
    time_set: 0,
    time_modified: 0,
    seen: false
  }
  slideOption = {
    slidesPerView: 'auto',
    grabCursor: true
  };
  show_datetime: boolean = false;
  appointment_changed: boolean = false;
  loaded: boolean = false;

  constructor(
    private appointment_svc: AppointmentService,
    private activated_route: ActivatedRoute,
    private router: Router,
    private user_svc: UserService,
    private user_init_svc: UsersService,
    private room_svc: RoomService,
    private ionic_component_svc: IonicComponentService) { }

  ngOnInit(){
    if(!this.activated_route.snapshot.paramMap.get('appointment_id')){
      console.log("running appointment from room...")
      this.getRooms()
      this.getAgent()
      //this.getClient()
    }else if(this.activated_route.snapshot.paramMap.get('appointment_id')){
      console.log("running appointment...")
      this.ionic_component_svc.presentLoading();
      this.appointment_svc.getAppointment(this.activated_route.snapshot.paramMap.get('appointment_id'))
      .subscribe(appt =>{
        this.appointment = this.appointment_svc.copyAppointment(appt);
        this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
      },
      err =>{
        console.log(err);
        this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
      })
    }  
  }

  getAgent(){
    if(this.activated_route.snapshot.paramMap.get('agent_id') ){
      this.ionic_component_svc.presentLoading();
      //console.log("agent loading...")
      this.user_svc.getUser(this.activated_route.snapshot.paramMap.get('agent_id'))
      .pipe(take(1))
      .subscribe(usr =>{
        this.appointment.agent = this.user_init_svc.copyUser(usr);
        //this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
        //console.log("agent loaded...")
        this.getClient()
      },
      err =>{
        console.log(err);
        this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
      })
    }
  }

  getClient(){
    if(this.activated_route.snapshot.paramMap.get('client_id')){
      //this.ionic_component_svc.presentLoading();
      //console.log("client loading...")
      this.user_svc.getClient(this.activated_route.snapshot.paramMap.get('client_id'))
      .pipe(take(1))
      .subscribe(usr =>{
        this.appointment.client = this.user_init_svc.copyClient(usr);
        this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
        //console.log("client loaded...")
      },
      err =>{
        console.log(err);
        this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
      })
    }
  }

  getRooms(){
    if(this.activated_route.snapshot.paramMap.get('rooms')){
      //console.log("rooms loading...")
      //this.ionic_component_svc.presentLoading();
      let room_ids = this.activated_route.snapshot.paramMap.get('rooms').split(',');
      this.room_svc.getRoomsIn(room_ids)
      .pipe(take(1))
      .subscribe(rms =>{
        this.appointment.rooms = rms;
        //this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
        //console.log("rooms loaded...")
        this.appointment.rooms.forEach(rm =>{
          this.appointment.landlord_confirmations.push(false);
          this.appointment.landlord_declines.push(false);
        })
        this.appointment.location = this.appointment.rooms[0].property.address;
      },
      err =>{
        console.log(err);
        this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
      })
    }
  }

  showDatePicker(){
    this.show_datetime = !this.show_datetime;
  }

  openRoom(room_id){
    this.router.navigate(['/room', {'room_id': room_id}]);
  }

  updateRoomPicLoaded(i){
    this.appointment.rooms[i].dp_loaded = true;
  }

  datetimeChanged(event){
    this.appointment.date = event.detail.value;
    this.appointment.time_set = Date.now();
    this.appointment.time_modified = Date.now();
    this.appointment_changed = true;
  }

  formatDate(value: string){
    return format(new Date(value), 'PPPPp');
  }

  setAppointment(){
    this.appointment.client_confirmed = true;
    this.ionic_component_svc.presentLoading();
    if(this.appointment.appointment_id != ""){
      this.syncAppointment()
      .then(() =>{
        this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
      })
      .catch(err =>{
        console.log(err)
        this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
      })
    }else{
      this.appointment_svc.createAppointment(this.appointment)
      .then(ref =>{
        this.appointment.appointment_id = ref.id;
        this.syncAppointment()
        .then(() =>{
          this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
        })
        .catch(err =>{
          console.log(err)
          this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
        })
      })
      .catch(err =>{
        this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
        this.ionic_component_svc.presentAlert(err.message);
        console.log(err);
      })
    }
  }

  cancelAppointment(){
    if(this.appointment.client_cancels == false && this.appointment.appointment_id != ""){
      this.ionic_component_svc.presentLoading();
      this.appointment.client_cancels = true;
      this.appointment.client_confirmed = false;
      this.appointment_svc.updateAppointment(this.appointment)
      .then(() =>{
        this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
        this.ionic_component_svc.presentAlert("Appointment successfully cancelled");
      })
      .catch(err =>{
        this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
        this.ionic_component_svc.presentAlert("Could not cancel appointment");
      })
    }else{
      this.ionic_component_svc.presentAlert("Could not cancel unconfirmed appointment");
    }
  }

  confirmAppointment(){
    if(this.appointment.client_confirmed == false && this.appointment.appointment_id != ""){
      this.ionic_component_svc.presentLoading();
      this.appointment.client_confirmed = true;
      this.appointment.client_cancels = false;
      this.appointment_svc.updateAppointment(this.appointment)
      .then(() =>{
        this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
        this.ionic_component_svc.presentAlert("Appointment successfully confirmed");
      })
      .catch(err =>{
        this.ionic_component_svc.dismissLoading().catch(err => console.log(err));
        this.ionic_component_svc.presentAlert("Could not confirm appointment");
      })
    }else{
      this.ionic_component_svc.presentAlert("Could not confirm appointment");
    }
  }

  confirmDatetime(){
    //this.datetime.confirm(true);
    this.showDatePicker();
  }

  cancelDatetime(){
    //this.datetime.cancel(true);
    this.showDatePicker();
  }


  syncAppointment(){
    return this.appointment_svc.updateAppointment(this.appointment)
    .then(() =>{
      this.ionic_component_svc.presentAlert("Appointment successfully set!");
    })
    .catch(err =>{
      this.ionic_component_svc.presentAlert(err.message);
      console.log(err);
    })
  }

}
