import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Partnership } from 'src/app/models/partnership.model';
import { ChatService } from '../../object-init/chat.service';
import { ChattService } from '../../services/chatt.service';
import { IonicComponentService } from '../../services/ionic-component.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.page.html',
  styleUrls: ['./roles.page.scss'],
})
export class RolesPage implements OnInit {

  partnership: Partnership;
  role: string = "";
  uid: string = "";
  firstname: string = "";
  lastname: string = "";
  phone_number: string = "";
  email: string = "";
  sent: boolean = false;
  err_message: string = "";
  constructor(
    private activated_route: ActivatedRoute,
    private router: Router,
    private chat_init_svc: ChatService,
    private chat_svc: ChattService,
    private modal_controller: ModalController,
    private ionic_component_svc: IonicComponentService
  ) { 
    this.partnership = this.chat_init_svc.defaultPartnership();
    this.role= this.activated_route.snapshot.paramMap.get("role") || "";
    this.uid = this.activated_route.snapshot.paramMap.get("uid") || "";
    this.firstname = this.activated_route.snapshot.paramMap.get("firstname") || "";
    this.lastname = this.activated_route.snapshot.paramMap.get("lastname");
    this.email = this.activated_route.snapshot.paramMap.get("email") || "";
    this.phone_number = this.activated_route.snapshot.paramMap.get("phone_number") || "";
  }

  ngOnInit() {
    this.partnership.role = this.role;
    this.partnership.uid = this.uid;
    this.partnership.firstname = this.firstname;
    this.partnership.lastname = this.lastname;
    this.partnership.email = this.email;
    this.partnership.phone_number = this.phone_number;
    console.log(this.partnership);
  }

  async close(){
    await this.modal_controller.dismiss();
  }

  urlEncodedMessge(): string{
    let msg: string = `Hi my name is ${this.partnership.firstname} ${this.partnership.lastname}, I am a ${this.partnership.role} at 
    ${this.partnership.company} and I would like to do business with Clickinn.\n`;
    return encodeURI(msg);
  }

  //Send a follow up
  generateWhatsAppLink(): string{
    //Composing message
    let msg: string = this.urlEncodedMessge();
    return `https://wa.me/+27671093186?text=${msg}`;
  }

  submit(){
    this.err_message = "";
    if(this.partnership.firstname == "" || this.partnership.firstname.length < 2){
      this.err_message = "Please enter a firstname with more than two characters";
    }else if(this.partnership.lastname == "" || this.partnership.lastname.length < 3){
      this.err_message = "Please enter a lastname with more than two characters";
    }else if(this.partnership.email == ""){
      this.err_message = "email left blank";
    }else if(this.partnership.phone_number.length > 10 || this.partnership.phone_number.length < 10){
      this.err_message = "Please enter a SA phone number";
    }else{
      this.partnership.time = Date.now();
      this.ionic_component_svc.presentLoading();
      this.chat_svc.createPartnership(this.partnership)
      .then(ref =>{
        this.partnership.id = ref.id;
        this.chat_svc.updatePartnership(this.partnership)
        .then(() =>{
          this.sent = true;
          this.ionic_component_svc.dismissLoading()
          .catch(err =>{
            console.log(err)
          })
        })
        .catch(err =>{
          console.log(err)
          this.ionic_component_svc.dismissLoading()
          .catch(err =>{
            console.log(err)
          })
        })
      })
      .catch(err =>{
        console.log(err)
        this.ionic_component_svc.dismissLoading()
        .catch(err =>{
          console.log(err)
        })
      })
    }
  }

}
