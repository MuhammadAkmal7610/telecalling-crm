import { Injectable } from '@nestjs/common';

@Injectable()
export class AppConfigService {
    getHomeConfig() {
        return {
            uiLabels: {
                getStartedTitle: 'Get Started',
                getStartedSub: 'Quick actions to setup your CRM.',
                setupGuideBtn: 'Setup Guide',
                integrationsTitle: 'Integrations',
                integrationsSub: 'Connect your favorite tools.',
                exploreAll: 'Explore All >',
                appName: 'WeWave CRM',
                appSubtitle: 'WeWave Inc.',
                installBtn: 'Install',
                helpTitle: 'Need Help?',
                helpSub: 'Stuck somewhere? Request support or watch our guide videos.',
                helpVideosBtn: 'View Help Videos',
                quickLinksTitle: 'Quick Links'
            },
            getStartedActions: [
                { title: 'Add Team', description: 'Collaborate with team at one location', icon: 'UserPlusIcon', buttonText: '+ Add Team', path: '/users' },
                { title: 'Excel upload', description: 'Import your data flexibly', icon: 'DocumentArrowUpIcon', buttonText: '+ Import data', path: '/import-leads' },
                { title: 'Campaign', description: 'Create calling campaigns for your team', icon: 'MegaphoneIcon', buttonText: '+ Create Campaign', action: 'create-campaign' },
                { title: 'Lead', description: 'Connect with potential customers', icon: 'SignalIcon', buttonText: '+ Add lead', path: '/add-lead' },
                { title: 'Reports', description: 'Analyse your team performance', icon: 'PresentationChartLineIcon', buttonText: 'Check reports', path: '/reports' },
                { title: 'Lead Fields', description: 'Create your custom lead fields', icon: 'AdjustmentsHorizontalIcon', buttonText: '+ Custom Field', path: '/lead-fields' },
            ],
            integrations: [
                { name: 'Facebook', description: 'Capture and instantly engage with Facebook leads.', color: 'blue', linkText: 'How to use', buttonText: 'Connect', icon: 'FacebookLogo' },
                { name: 'Google sheet', description: 'Capture and instantly engage with Google Sheet leads.', color: 'green', linkText: 'How to use', buttonText: 'Connect', icon: 'GoogleSheetsLogo' },
            ],
            importantLinks: [
                { name: 'Configure sim', icon: 'WrenchScrewdriverIcon', path: '/dialer-settings' },
                { name: 'Configure call recording', icon: 'PhoneIcon', path: '/dialer-settings' },
                { name: 'How to start calling', icon: 'PlayCircleIcon', action: 'setup-guide' },
                { name: 'Buy new License', icon: 'ShoppingCartIcon', path: '/billing' },
                { name: 'Get WhatsApp Official API', icon: 'ChatBubbleLeftRightIcon', path: '/integrations' },
                { name: 'Create Automation', icon: 'BoltIcon', path: '/automations' },
            ],
            appStats: {
                rating: 4.8,
                reviews: "2K",
                downloads: "10K+",
                category: "Business",
                verified: true
            }
        };
    }
}
