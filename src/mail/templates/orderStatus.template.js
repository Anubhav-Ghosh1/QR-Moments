export const orderUpdateNotification = ({ fullName, orderId, 
    updatedAt, currentYear }) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Update Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
            color: #333333;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .header {
            background-color: #4CAF50;
            color: white;
            padding: 10px 0;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .order-details {
            margin: 20px 0;
        }
        .order-details table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .order-details th, .order-details td {
            text-align: left;
            padding: 8px;
            border-bottom: 1px solid #ddd;
        }
        .order-details th {
            background-color: #f4f4f4;
        }
        .text-center
        {
            text-align: center;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            color: #777;
            font-size: 14px;
        }
        @media screen and (max-width: 600px) {
            .container {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Update Notification</h1>
        </div>
        
        <h2>Hi, ${fullName}!</h2>

        <p>Your order with ID <strong>${orderId}</strong> has been updated. Here are the details:</p>

        <div class="order-details">
            
        </div>

        <p>The order was last updated on: <strong>${updatedAt}</strong></p>

        <p class="text-center">If you have any questions or need further assistance, feel free to contact us.</p>

        <div class="footer">
            <p>&copy; ${currentYear} Diner's Find. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
};