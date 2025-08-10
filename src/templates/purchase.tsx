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
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f7f9fc; padding: 2rem; border-radius: 10px; max-width: 480px; margin: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
      <div style="text-align: center; margin-bottom: 2rem;">
        <span style="display: inline-block; background: #2e5bff; color: #fff; font-weight: bold; font-size: 1.4rem; letter-spacing: 2px; padding: 0.5rem 1.5rem; border-radius: 6px;">
          COURGEN
        </span>
      </div>
      <h2 style="color: #2e5bff; margin-bottom: 0.5rem;">Hi ${username},</h2>
      <p style="font-size: 1.05rem;">Thank you for purchasing <strong>${subscription}</strong>!</p>
      <div style="background: #fff; border-radius: 8px; padding: 1rem; margin: 1rem 0; box-shadow: 0 1px 4px rgba(46,91,255,0.08);">
        <p style="margin: 0.3rem 0;"><strong>Purchase Date:</strong> ${purchaseDate}</p>
        <p style="margin: 0.3rem 0;"><strong>Amount Paid:</strong> ₹${amount}</p>
      </div>
      <p>If you have any questions or feedback, feel free to reach out.</p>
      <p style="margin-top: 1.5rem; color: #444;">Happy learning! <span style="font-size: 1.2rem;">🎓</span></p>
    </div>
  `;
}
