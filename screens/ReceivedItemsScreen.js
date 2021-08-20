import React, { Component } from 'react';
import { View, StyleSheet, Text, FlatList,TouchableOpacity } from 'react-native';
import { ListItem } from 'react-native-elements'

import firebase from 'firebase';
import db from '../config'
import MyHeader from '../components/MyHeader';
import { TouchableHighlightBase } from 'react-native';

export default class ReceivedItemsScreen extends Component{
    constructor(){
        super();
        this.state={
            userId:firebase.auth().currentUser.email,
            receivedItemsList:[]
        }
        this.requestRef = null
    }

    getReceivedItemsList=()=>{
        this.requestRef = db.collection("requested_items")
        .where('user_id','==',this.state.userId)
        .where("item_status",'==','received')
        .onSnapshot((snapshot)=>{
            var receivedItemsList = snapshot.docs.map((doc)=>doc.data())
            this.setState({
                receivedItemsList:receivedItemsList
            })
        })
    }

    componentDidMount(){
        this.getReceivedItemsList()
    }

    componentWillUnmount(){
        this.requestRef();
    }

    keyExtractor = (item,index) => index.toString()
    renderItem = ({item, i}) =>{
        console.log(item.item_name);
        return(
            <ListItem  
            key={i}
            title = {item.item_name}
            subtitle={item.itemStatus}
            titleStyle={{color:'black',fontWeight:'bold'}}
            bottomDivider
            />
        )
    }

    render(){
        return(
           <View style={{flex:1}}>
               <MyHeader title="Received Items" navigation={this.props.navigation}/>
               <View style={{flex:1}}>
                   {
                       this.state.receivedItemsList.length === 0
                       ?(
                           <View style={styles.subcontainer}>
                               <Text style={{fontSize:20}}>List of all received items</Text>
                            </View>
                       )
                       :(
                           <FlatList
                           keyExtractor={this.keyExtractor}
                           data={this.state.receivedItemsList}
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
    subcontainer:{
        flex:1,
        fontSize:20,
        justifyContent:'center',
        alignItems:'center'
    }
})