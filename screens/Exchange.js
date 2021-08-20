import React, {Component} from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet, Alert, Modal, KeyboardAvoidingView,ScrollView} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader'

export default class Exchange extends Component{
    constructor(){
      super();
      this.state ={
        userId : firebase.auth().currentUser.email,
        itemName:"",
        reasonToRequest:"",
        isExchangeRequestActive:'',
        requestedItemName:'',
        itemStatus:'',
        requestId:'', 
        userDocId:'',
        docId:'',
        currencyCode:""
      }
    }
  
    createUniqueId(){
      return Math.random().toString(36).substring(7);
    }
  
    addRequest =async(itemName,reasonToRequest)=>{
      var userId = this.state.userId
      var randomRequestId = this.createUniqueId()
      db.collection('requested_items').add({
          "user_id": userId,
          "item_name":itemName,
          "reason_to_request":reasonToRequest,
          "request_id"  : randomRequestId
      })
      
      await this.getBookRequest()
      db.collection('users').where('email_id','==',userId).get()
      .then()
      .then((snapshot)=>{
        snapshot.forEach((doc)=>{
          db.collection('users').doc(doc.id).update({
            isItemRequestActive:true
          })
        })
      })
  
      this.setState({
          itemName :'',
          reasonToRequest : '',
          requestId:randomRequestId
      })
  
      return Alert.alert("Item Requested Successfully")
    }
  
    receivedBooks=(itemName)=>{
      var userId = this.state.userId
      var requestId = this.state.requestId
      db.collection('received_items').add({
        'user_id':userId,
        'item_name':itemName,
        'request_id':requestId,
        'itemStatus':"received"
      })
    }
  
    getIsItemRequestActive=()=>{
      db.collection('users').where('email_id','==',this.state.userId)
      .onSnapshot(querySnapshot=>{
        querySnapshot.forEach(doc=>{
          this.setState({
            isItemRequestActive:doc.data().isItemRequestActive,
            userDocId:doc.id
          })
        })
      })
    }

    getItemRequest=()=>{
      var bookRequest = db.collection('requested_items')
      .where('user_id','==',this.state.userId).get()
      .then((snapshot)=>{
        snapshot.forEach((doc)=>{
          if(doc.data().item_status !== "received"){
            this.setState({
              requestId:doc.data().request_id,
              requestedItemName:doc.data().item_name,
              itemStatus:doc.data().item_status,
              docId:doc.id
            })
          }
        })
      })
    }

    sendNotification=()=>{
      db.collection('users').where('email_id','==',this.state.userId).get()
      .then((snapshot)=>{
        snapshot.forEach((doc)=>{
          var name = doc.data().first_name;
          var last_name = doc.data().last_name
          db.collection('all_notifications').where('request_id','==',this.state.requestId).get()
          .then((snapshot)=>{
            snapshot.forEach((doc)=>{
              var donorId = doc.data().donor_id;
              var itemName = doc.data().item_name;
              db.collection('all_notifications').add({
                "targeted_user_id":donorId,
                "message":name+''+last_name+''+"received"+''+itemName,
                "notification_status":"unread",
                "item_name":itemName
              })
            })
          })
        })
      })
    }

    componentDidMount(){
      this.getItemRequest()
      this.getIsItemRequestActive()
    }

    updateBookRequestStatus=()=>{
      db.collection('requested_items').doc(this.state.docId)
      .update({
        item_status:'received'
      })
      db.collection('users').where('email_id','==',this.state.userId).get()
      .then((snapshot)=>{
        snapshot.forEach((doc)=>{
          db.collection('users').doc(doc.id).update({
            isItemRequestActive:false
          })
        })
      })
    }

    getData(){
      fetch("d7f59a70be91afbf1bb5d2fbea6a22a3")
      .then(response=>{
        return response.json();
      }).then(responseData=>{
        var currencyCode = this.state.currencyCode
        var currency = responseData.rates.INR
        var value = 69/currency
        console.log(value)
      })
    }
  
    render(){
        if(this.state.isExchangeRequestActive === true){
          return(
            <View style={{flex:1,justifyContent:'center'}}>
            <View style={{borderColor:"orange",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
              <Text>Item Name</Text>
              <Text>{this.state.requestedItemName}</Text>
            </View>

            <View style={{borderColor:"orange",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
              <Text>Item Status</Text>
              <Text>{this.state.itemStatus}</Text>
            </View>

            <View style={{borderColor:"orange",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
              <Text>Item Value</Text>
              <Text>{this.state.currencyCode}</Text>
            </View>

            <TouchableOpacity style={{borderWidth:1,borderColor:'orange',backgroundColor:"orange",width:300,alignSelf:'center',alignItems:'center',height:30,marginTop:30}}
            onPress={()=>{
              this.sendNotification()
              this.updateItemRequestStatus()
              this.receivedItems(this.state.requestedItemName)
              this.getData()
            }}>
              <Text>I received the item</Text>
            </TouchableOpacity>
         </View>
          )
        }else{
          return(
          <View style={{flex:1}}>
          <MyHeader title="Request item"/>
            <KeyboardAvoidingView style={styles.keyBoardStyle}>
              <TextInput
                style ={styles.formTextInput}
                placeholder={"enter item name"}
                onChangeText={(text)=>{
                    this.setState({
                        item_name:text
                    })
                }}
                value={this.state.item_name}
              />
              <TextInput
                style ={[styles.formTextInput,{height:300}]}
                multiline
                numberOfLines ={8}
                placeholder={"Why do you need the item"}
                onChangeText ={(text)=>{
                    this.setState({
                        reasonToRequest:text
                    })
                }}
                value ={this.state.reasonToRequest}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={()=>{this.addRequest(this.state.item_name,this.state.reasonToRequest)}}
                >
                <Text>Request</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
        </View>
        )
      }}
  }
  
  
  const styles = StyleSheet.create({
    keyBoardStyle : {
      flex:1,
      alignItems:'center',
      justifyContent:'center'
    },
    formTextInput:{
      width:"75%",
      height:35,
      alignSelf:'center',
      borderColor:'#ffab91',
      borderRadius:10,
      borderWidth:1,
      marginTop:20,
      padding:10,
    },
    button:{
      width:"75%",
      height:50,
      justifyContent:'center',
      alignItems:'center',
      borderRadius:10,
      backgroundColor:"#ff5722",
      shadowColor: "#000",
      shadowOffset: {
         width: 0,
         height: 8,
      },
      shadowOpacity: 0.44,
      shadowRadius: 10.32,
      elevation: 16,
      marginTop:20
      },
    } 
  )