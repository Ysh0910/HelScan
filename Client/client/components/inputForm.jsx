import { useForm } from "react-hook-form";
import axios from 'axios';

export default function InputForm(){
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting},
    } = useForm();

    const onSubmit = async (data)=> {
        console.log("Form Data:", data);
        try{
            await axios.post('http://localhost:3000/riderform', data);
            alert("Profile Saved");
        }catch(e){
            console.error(e);
            alert("Error saving data");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label>FirstName</label>
                <input type="text" {...register("firstName", { required: true })} />
                {errors.firstName && <span>This field is required</span>}
            </div>

            <br />

            <div>
                <label>LastName</label>
                <input type="text" {...register("lastName")} />
            </div>
            
            <br />

            <div>
                <label>Date of Birth</label>
                <input type="date" {...register("dob")} />
            </div>

            <br />

            <div>
                <label>Blood Group:</label>
                <select {...register("bloodGroup")}>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                </select>
            </div>

            <br />

            <div>
                <label>Height</label>
                <input type="text" {...register("height")} />
            </div>

            <br />

            <div>
                <label>Weight</label>
                <input type="number" {...register("weight")} />
            </div>

            <br />

            <div>
                <label>Identification Mark</label>
                <input type="text" {...register("idMark")} />
            </div>

            <br />

            <div>
                <label>Allergies:</label>
                <input type="text" {...register("allergy")} />
            </div>

            <br /> 

            <div>
                <label>Medical Conditions</label>
                <input type="text" {...register("medicalConditions")}/>
            </div>

            <br />

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
            </button>
        </form>
    )
}
