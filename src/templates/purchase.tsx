import * as React from 'react';

export default function PurchaseEmail({
  username,
  subscription,
  purchaseDate,
  amount,
}: {
  username: string;
  subscription: string;
  purchaseDate: string;
  amount: string;
}) {
   return `
    <div style="font-family: sans-serif; padding: 1rem; line-height: 1.5;">
      <h2>Hi ${username},</h2>
      <p>Thank you for purchasing <strong>${subscription}</strong>!</p>

      <p><strong>Purchase Date:</strong> ${purchaseDate}</p>
      <p><strong>Amount Paid:</strong> ₹${amount}</p>

      <p>If you have any questions or feedback, feel free to reach out.</p>
      <p style="margin-top: 1rem;">Happy learning! 🎓</p>
    </div>
  `;
}
