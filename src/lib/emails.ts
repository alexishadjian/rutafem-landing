/**
 * Email Service - All email sending functions using Resend
 */

import { ADMIN_EMAIL, BASE_URL, EMAIL_FROM, resend } from './resend';

type TripInfo = {
    tripId: string;
    departureCity: string;
    arrivalCity: string;
    departureDate: string;
    departureTime: string;
    departureAddress: string;
    arrivalAddress: string;
    pricePerSeat: number;
};

type BookingEmailParams = {
    passengerEmail: string;
    passengerName: string;
    driverEmail: string;
    driverName: string;
    trip: TripInfo;
    orderId: string;
};

type CancellationEmailParams = {
    recipientEmail: string;
    recipientName: string;
    cancellerName: string;
    cancellerRole: 'driver' | 'passenger';
    trip: TripInfo;
};

type DisputeEmailParams = {
    tripId: string;
    orderId: string;
    disputedBy: 'driver' | 'passenger';
    disputerName: string;
    tripInfo: string;
};

type ConfirmationReminderParams = {
    email: string;
    name: string;
    role: 'driver' | 'passenger';
    trip: TripInfo;
    orderId: string;
    confirmUrl: string;
};

// ============================================================================
// BOOKING CREATED EMAILS
// ============================================================================

/** Send confirmation email to passenger after booking */
export const sendBookingConfirmationToPassenger = async (params: BookingEmailParams) => {
    const { passengerEmail, passengerName, driverName, trip } = params;

    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: passengerEmail,
            subject: `🚗 Ta réservation est confirmée ! ${trip.departureCity} → ${trip.arrivalCity}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #2d5a4a;">Bravo ${passengerName} ! 🎉</h1>
                    <p>Ta réservation pour le trajet suivant est confirmée :</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h2 style="margin-top: 0; color: #333;">${trip.departureCity} → ${trip.arrivalCity}</h2>
                        <p><strong>📅 Date :</strong> ${trip.departureDate}</p>
                        <p><strong>🕐 Heure :</strong> ${trip.departureTime}</p>
                        <p><strong>📍 Départ :</strong> ${trip.departureAddress}</p>
                        <p><strong>📍 Arrivée :</strong> ${trip.arrivalAddress}</p>
                        <p><strong>💰 Prix :</strong> ${trip.pricePerSeat}€</p>
                        <p><strong>👩 Conductrice :</strong> ${driverName}</p>
                    </div>
                    
                    <p>Tu peux contacter ta conductrice pour préparer votre trajet ensemble.</p>
                    
                    <a href="${BASE_URL}/trip/${trip.tripId}" style="display: inline-block; background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px;">
                        Voir le trajet
                    </a>
                    
                    <p style="margin-top: 30px; color: #666; font-size: 14px;">
                        Après le trajet, tu recevras un email pour confirmer que tout s'est bien passé.
                    </p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">RutaFem - Le covoiturage entre femmes</p>
                </div>
            `,
        });
        console.log(`[EMAIL] Booking confirmation sent to passenger: ${passengerEmail}`);
    } catch (error) {
        console.error('[EMAIL] Failed to send booking confirmation to passenger:', error);
    }
};

/** Send notification email to driver about new passenger */
export const sendNewPassengerNotificationToDriver = async (params: BookingEmailParams) => {
    const { driverEmail, driverName, passengerName, trip } = params;

    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: driverEmail,
            subject: `👋 Nouvelle passagère pour ton trajet ${trip.departureCity} → ${trip.arrivalCity}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #2d5a4a;">Bonne nouvelle ${driverName} ! 🎉</h1>
                    <p><strong>${passengerName}</strong> a réservé une place sur ton trajet :</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h2 style="margin-top: 0; color: #333;">${trip.departureCity} → ${trip.arrivalCity}</h2>
                        <p><strong>📅 Date :</strong> ${trip.departureDate}</p>
                        <p><strong>🕐 Heure :</strong> ${trip.departureTime}</p>
                    </div>
                    
                    <p>Tu peux la contacter pour organiser les détails du trajet.</p>
                    
                    <a href="${BASE_URL}/trip/${trip.tripId}" style="display: inline-block; background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px;">
                        Voir le trajet
                    </a>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">RutaFem - Le covoiturage entre femmes</p>
                </div>
            `,
        });
        console.log(`[EMAIL] New passenger notification sent to driver: ${driverEmail}`);
    } catch (error) {
        console.error('[EMAIL] Failed to send new passenger notification to driver:', error);
    }
};

// ============================================================================
// CANCELLATION EMAILS
// ============================================================================

/** Send cancellation notification email */
export const sendCancellationEmail = async (params: CancellationEmailParams) => {
    const { recipientEmail, recipientName, cancellerName, cancellerRole, trip } = params;

    const cancellerLabel = cancellerRole === 'driver' ? 'La conductrice' : 'La passagère';
    const subject =
        cancellerRole === 'driver'
            ? `⚠️ Trajet annulé : ${trip.departureCity} → ${trip.arrivalCity}`
            : `ℹ️ Annulation passagère : ${trip.departureCity} → ${trip.arrivalCity}`;

    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: recipientEmail,
            subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #2d5a4a;">Bonjour ${recipientName},</h1>
                    
                    <p>${cancellerLabel} <strong>${cancellerName}</strong> a annulé ${cancellerRole === 'driver' ? 'le trajet' : 'sa participation au trajet'} :</p>
                    
                    <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <h2 style="margin-top: 0; color: #333;">${trip.departureCity} → ${trip.arrivalCity}</h2>
                        <p><strong>📅 Date :</strong> ${trip.departureDate}</p>
                        <p><strong>🕐 Heure :</strong> ${trip.departureTime}</p>
                    </div>
                    
                    ${cancellerRole === 'driver'
                    ? '<p>Si tu avais payé, le remboursement sera effectué automatiquement.</p>'
                    : '<p>Une place est de nouveau disponible sur ton trajet.</p>'
                }
                    
                    <a href="${BASE_URL}/join-trip" style="display: inline-block; background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px;">
                        ${cancellerRole === 'driver' ? 'Trouver un autre trajet' : 'Voir mes trajets'}
                    </a>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">RutaFem - Le covoiturage entre femmes</p>
                </div>
            `,
        });
        console.log(`[EMAIL] Cancellation notification sent to: ${recipientEmail}`);
    } catch (error) {
        console.error('[EMAIL] Failed to send cancellation notification:', error);
    }
};

// ============================================================================
// DISPUTE EMAIL
// ============================================================================

/** Send dispute notification to admin */
export const sendDisputeNotificationToAdmin = async (params: DisputeEmailParams) => {
    const { tripId, orderId, disputedBy, disputerName, tripInfo } = params;

    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: ADMIN_EMAIL,
            subject: `🚨 Litige signalé - Trip ${tripId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #dc3545;">⚠️ Litige signalé</h1>
                    
                    <div style="background: #f8d7da; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #dc3545;">
                        <p><strong>Signalé par :</strong> ${disputerName} (${disputedBy === 'driver' ? 'Conductrice' : 'Passagère'})</p>
                        <p><strong>Trip ID :</strong> ${tripId}</p>
                        <p><strong>Order ID :</strong> ${orderId}</p>
                        <p><strong>Trajet :</strong> ${tripInfo}</p>
                    </div>
                    
                    <p>Le paiement est bloqué en attente de résolution.</p>
                    
                    <p><strong>Actions à effectuer :</strong></p>
                    <ul>
                        <li>Contacter les deux parties pour comprendre la situation</li>
                        <li>Décider de capturer ou rembourser le paiement</li>
                    </ul>
                    
                    <a href="${BASE_URL}/trip/${tripId}" style="display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px;">
                        Voir le trajet
                    </a>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">RutaFem Admin</p>
                </div>
            `,
        });
        console.log(`[EMAIL] Dispute notification sent to admin`);
    } catch (error) {
        console.error('[EMAIL] Failed to send dispute notification to admin:', error);
    }
};

// ============================================================================
// CONFIRMATION REMINDER EMAIL (Post-trip)
// ============================================================================

/** Send confirmation reminder email after trip */
export const sendConfirmationReminderEmail = async (params: ConfirmationReminderParams) => {
    const { email, name, role, trip, confirmUrl } = params;

    const roleLabel = role === 'driver' ? 'conductrice' : 'passagère';

    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: email,
            subject: `✅ Confirme ton trajet ${trip.departureCity} → ${trip.arrivalCity}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #2d5a4a;">Bonjour ${name} ! 👋</h1>
                    
                    <p>Ton trajet en tant que ${roleLabel} a eu lieu hier :</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h2 style="margin-top: 0; color: #333;">${trip.departureCity} → ${trip.arrivalCity}</h2>
                        <p><strong>📅 Date :</strong> ${trip.departureDate}</p>
                    </div>
                    
                    <p><strong>Tout s'est bien passé ?</strong></p>
                    <p>Clique sur le bouton ci-dessous pour confirmer. Une fois que les deux parties auront confirmé, le paiement sera validé.</p>
                    
                    <a href="${confirmUrl}" style="display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin-top: 10px; font-size: 16px;">
                        ✅ Confirmer le trajet
                    </a>
                    
                    <p style="margin-top: 20px; color: #666;">
                        Si tu as rencontré un problème, tu peux le signaler sur cette même page.
                    </p>
                    
                    <p style="margin-top: 30px; padding: 15px; background: #fff3cd; border-radius: 8px; color: #856404;">
                        ⏰ <strong>Important :</strong> Sans action de ta part dans les 24h, le paiement sera automatiquement validé.
                    </p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">RutaFem - Le covoiturage entre femmes</p>
                </div>
            `,
        });
        console.log(`[EMAIL] Confirmation reminder sent to: ${email}`);
    } catch (error) {
        console.error('[EMAIL] Failed to send confirmation reminder:', error);
    }
};

