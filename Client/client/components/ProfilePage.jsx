import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ProfilePage = () => {
    const {id} = useParams();
    const [riderData, setRiderData] = useState(null);

    useEffect(()=>{
        const fetchRider = async ()=>{
            try {
                const response = await axios.get(`http://localhost:3000/rider/${id}`)
                setRiderData(response.data);
            } catch (error){
                console.log("error fetching data", error);
            }
        };
        fetchRider();
    },[id]);

    if(!riderData){
      return <div>Searching for rider records...</div>;
    }
  return (
    <div>
      <h1>Rider Details:</h1>
      <p>Name: {riderData.firstName} {riderData.lastName}</p>
      <p>photo: {riderData.photo}</p>
      <p>Date of Birth: {riderData.dob}</p>
      <p>Blood Group: {riderData.bloodGroup}</p>
      <p>Height: {riderData.height} cm</p>
      <p>Weight: {riderData.weight} kg</p>
    </div>
  )
}

export default ProfilePage
