import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ProfilePage = () => {
  const { id } = useParams();
  const [riderData, setRiderData] = useState(null);

  useEffect(() => {
    const fetchRider = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/rider/${id}`)
        setRiderData(response.data);
      } catch (error) {
        console.log("error fetching data", error);
      }
    };
    fetchRider();
  }, [id]);

  if (!riderData) {
    return <div>Searching for rider records...</div>;
  }
  return (
    <div>
      <h1>Rider Details:</h1>
      <p>Name: {riderData.firstName} {riderData.lastName}</p>
      <p>photo: <img src={riderData.photo} alt="Rider" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%' }} /></p>
      <p>Date of Birth: {riderData.dob}</p>
      <p>Blood Group: {riderData.bloodGroup}</p>
      <p>Height: {riderData.height} cm</p>
      <p>Weight: {riderData.weight} kg</p>
      <p>Identification mark: {riderData.identificationMark}</p>
      <p>Allergies: {riderData.allergies}</p>
      <p>Medical Conditions: {riderData.medicalConditions}</p>
      <p>Current Medication: {riderData.currentMedications}</p>
      <p>Emergency Contanct: {riderData.emergencyContacts.name},{riderData.emergencyContacts.phone}</p>
    </div>
  )
}

export default ProfilePage
