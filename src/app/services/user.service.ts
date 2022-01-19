import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';
import { landlord } from '../models/landlord.model';
//import { Agent } from '../models/agent.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private afs: AngularFirestore) { }

  //Function that creates a new user in the User collection
  //usually called after a sign up
  //takes a user object as a parameter and returns a void promise on completion 
  //Uses the uid generated during user registration
  createUser(user: User):Promise<void>{
    return this.afs.collection('Agents').doc(user.uid).set(user);
  }

  //Function that updates the details of a particular user
  //Takes a user object as a parameter and returns a void promise on completion
  updateUser(user: User):Promise<void>{
    return this.afs.collection('Agents').doc(user.uid).update(user);
    //return this.afs.collection('Users').doc(user.uid).set(user);
  }

  //Function for retrieving a user object
  //Takes the user id (uid) as a parameter and returns a User Observable
  getUser(uid: string):Observable<User>{
    return this.afs.collection('Agents').doc<User>(uid).valueChanges();
  }

  getClient(uid: string){
    return this.afs.collection('Users').doc<Client>(uid).valueChanges();
  }

  updateClient(client: Client){
    return this.afs.collection('Users').doc(client.uid).update(client);
  }

  createClient(user: Client):Promise<void>{
    return this.afs.collection('Users').doc(user.uid).set(user);
  }

  signupUser(firstname, lastname, phone, username, password): Promise<any>{
    return null;
  }

  addLandlord(landlord: landlord){
    return this.afs.collection('Landlords').doc(landlord.uid).set(landlord);
  }

  /* getAgent(uid: string){
    return this.afs.collection('Agents').doc<Agent>(uid).valueChanges();
  }

  updateAgent(agent: Agent){
    return this.afs.collection('Agents').doc(agent.uid).update(agent);
  } */


}