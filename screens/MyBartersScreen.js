import React ,{Component} from 'react'
import {View, Text,TouchableOpacity,ScrollView,FlatList,StyleSheet} from 'react-native';
import {Card,Icon,ListItem} from 'react-native-elements'
import MyHeader from '../components/MyHeader.js'
import firebase from 'firebase';
import db from '../config.js'

export default class MyBartersScreen extends Component {
  static navigationOptions = { header: null };

   constructor(){
     super()
     this.state = {
       userId : firebase.auth().currentUser.email,
       allBarters : []
     }
     this.requestRef= null
   }


   getAllBarters =()=>{
     this.requestRef = db.collection("all_Barters").where("donor_id" ,'==', this.state.userId)
     .onSnapshot((snapshot)=>{
       var allBarters = snapshot.docs.map(document => document.data());
       this.setState({
         allBarters : allBarters,
       });
     })
   }

   keyExtractor = (item, index) => index.toString()

   renderItem = ( {item, i} ) =>(
    <ListItem
    key={i} bottomDivider>
        <ListItem.Content>
            <ListItem.Title>{item.item_name}</ListItem.Title>
             <ListItem.Subtitle>{item.description}</ListItem.Subtitle>
                 <TouchableOpacity style={styles.button}>
                   <Text style={{color:'#ffff'}}>Send Item</Text>
                 </TouchableOpacity>
                 
        </ListItem.Content>
    </ListItem>
   )

   sendNotification=(itemDetails,requestStatus)=>{
    var requestId = itemDetails.request_id;
    var donorId = itemDetails.donor_id;
    db.collection("all_donations")
    .where("request_id","==",requestId)
    .where("donor_id","==",donorId)
    .get()
    .then((snapshot)=>{
      snapshot.forEach((doc)=>{
        var message = '';
        if(requestStatus === "itemSent"){
          message = this.state.donorName + "sent you item"
        }else{
          message = this.state.donorName + "has shown interest in donating the item"
        }
        db.collection("all_notifications").doc(doc.id).update({
          "message":message,
          "notification_status":"unread",
          "date":firebase.firestore.FieldValue.serverTimestamp()
        })
      })
    })
  }
  
  sendItem=(itemDetails)=>{
    if(itemDetails.request_status === "itemSent"){
      var requestStatus = "donor interested"
      db.collection("all_donations").doc(itemDetails.doc_id).update({
        "requested_status":"donor interested"
      })
      this.sendNotification(itemDetails,requestStatus)
    }else{
      var requestStatus = "bookSent"
      db.collection("all_donations").doc(bookDetails.doc_id).update({
        "request_status":"itemSent"
      })
      this.sendNotification(itemDetails,requestStatus)
    }
  }  


   componentDidMount(){
     this.getAllBarters()
   }

   componentWillUnmount(){
     this.requestRef();
   }

   render(){
     return(
       <View style={{flex:1}}>
         <MyHeader navigation={this.props.navigation} title="My Barters"/>
         <View style={{flex:1}}>
           {
             this.state.allBarters.length === 0
             ?(
               <View style={styles.subtitle}>
                 <Text style={{ fontSize: 20}}>List of all Barters</Text>
               </View>
             )
             :(
               <FlatList
                 keyExtractor={this.keyExtractor}
                 data={this.state.allBarters}
                 renderItem={this.renderItem}
               />
             )
           }
         </View>
       </View>
     )
   }
   }


const styles = StyleSheet.create({
  button:{
    width:100,
    height:30,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:"#ff5722",
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8
     },
    elevation : 16
  },
  subtitle :{
    flex:1,
    fontSize: 20,
    justifyContent:'center',
    alignItems:'center'
  }
})