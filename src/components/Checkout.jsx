import { useContext } from "react"; 

import Modal from "./UI/Modal.jsx";
import CartContext from "../store/CartContext.jsx";
import UserProgressContext from "../store/UserProgressContext.jsx";
import { currencyFormatter } from "../util/Formatting.js";
import Input from "./UI/Input.jsx";
import Button from "./UI/Button.jsx";
import useHttp from "../hooks/useHttp.js";
import Error from '../components/Error.jsx'

const requsetConfig = {
    method: 'POST',
    headers:{
        'Content-Type': 'application/json'
      }
    };

export default function Checkout() {
    const cartCtx = useContext(CartContext)
    const userProgressCtx = useContext(UserProgressContext)

    const{
        data, 
        isLoading: isSending, 
        error, 
        sendRequest,
        clearData } = useHttp('http://localhost:3000/orders', requsetConfig,)

    const cartTotal = cartCtx.items.reduce(
        (totalPrice, item) => totalPrice + item.quantity * item.price, 0
    )

    function handleClose() {
        userProgressCtx.hideCheckout();
    }

    function handleFinish() {
        userProgressCtx.hideCheckout();
        cartCtx.clearCart();
        clearData();
    }

    function handleSubmit(event) {
        event.preventDefault();

        const fd = new FormData(event.target);
        const customerData = Object.fromEntries(fd.entries()); //{eamil: test@g.com}

        sendRequest(
            JSON.stringify({
                order:{
                    items:cartCtx.items,
                    customer: customerData
                }
       
            })
        );
    };

    let actions = (
        <>
          <Button type='button' textOnly onClick={handleClose}>
              Close
          </Button>
         <Button>Submit Order</Button>
        </>
    )

    if (isSending) {
        actions = <span>Sending order data...</span>
    }

    if (data && !error){
        return(
            <Modal open={userProgressCtx.progress ==='checkout'} onClose={handleFinish}>
                <h2>Sucess!</h2>
                <p>Your order submitted successfully.</p>
                <p>we will get back to you with more details via 
                    email with in the next few minutes. 
                </p>
                <p className="modal-actions">
                    <Button onClick={handleFinish}>Okay</Button>
                </p>
            </Modal>
        );
    }

    return(
        <Modal open={userProgressCtx.progress ==='checkout'} onClose={handleClose}>
            <form onSubmit={handleSubmit}>
                <h2>Checkout</h2>
                <p>Total Amount: {currencyFormatter.format(cartTotal)}</p>

                <Input label=" Full Name" type= "text" id="name" />
                <Input label="E-Mail" type= "email" id="email" />
                <Input label="Street" type= "text" id="street" />
                <div className="control-row">
                    <Input label="Postal Code" type="text" id="postal-code" />
                    <Input label="city" type="text" id="city" />
                </div>

                {error && <Error title='Failed to submit order' message={error} />}

                <p className="modal-actions">{actions}</p>
            </form>
        </Modal>
    )
}