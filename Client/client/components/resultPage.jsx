import React, {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

const resultPage = () => {
    const { id } = useParams();
    const [rider, setRider] = useState(null);

    useEffect(() => {
        const getRider = async () => {
            const res = await axios.get(`http://localhost:3000/rider/${id}`);
            setRider(res.data);
        };
        getRider();
    },[id]);

    if(!rider) return <p>Generating your sticker...</p>;

    const publicUrl = `${window.location.origin}/u/${id}`;

  return (
    <div>
      <p>Portfolio Created!!</p>
      <h3>Your safety qr code</h3>
      <QRCodeSVG value={publicUrl} size={200}/>
      <p>Sticker ID: {id}</p>

      <div>
        <p>Download pdf for helmet</p>
        <button onClick={()=> window.open(`http://localhost:3000/download-qr/${id}`,'_blank')}>
            Download
        </button>
      </div>
    </div>
  )
}

export default resultPage
