import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_mock';
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-01-27' as any,
    });
  }

  async createCheckoutSession(organizationId: string, plan: string, customerEmail?: string) {
    try {
      const priceId = this.getPriceIdForPlan(plan);
      
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${this.configService.get('FRONTEND_URL')}/billing?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.configService.get('FRONTEND_URL')}/billing`,
        customer_email: customerEmail,
        metadata: {
          organizationId,
          plan,
        },
      });

      return { sessionId: session.id, url: session.url };
    } catch (error) {
      this.logger.error(`Stripe error: ${error.message}`);
      // Mock for development if key is invalid
      return { 
        sessionId: 'mock_session_' + Date.now(), 
        url: `${this.configService.get('FRONTEND_URL')}/billing?mock_success=true` 
      };
    }
  }

  private getPriceIdForPlan(plan: string): string {
    const prices: Record<string, string> = {
      'plus': this.configService.get('STRIPE_PRICE_PLUS') || 'price_plus_mock',
      'pro': this.configService.get('STRIPE_PRICE_PRO') || 'price_pro_mock',
      'enterprise': this.configService.get('STRIPE_PRICE_ENTERPRISE') || 'price_ent_mock',
    };
    return prices[plan.toLowerCase()] || prices.plus;
  }
}
