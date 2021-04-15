  /**
   * Component paths mapped to owning teams.
   * Intended to be used for 'includes' string matches rather than exact match.
   * For example, 'components/Address' would also match 'components/AddressSearch'.
   */
	 const componentPathsByTeam = {
    'account': [
      'components/Address',
      'components/MarketingPreferences',
      'components/MyAccount',
      'components/MyDetails',
      'components/SeachNavigateBack', // used for AddressSearch (note misspelling)
      'ingredients/AddressTile',
    ],
    'browse': [
      'components/AddAllItemsErrorModal',
      'components/AppBanner',
      'components/BackToTop',
      'components/Breadcrumbs',
      'components/CategoryLinks',
      'components/ClickToBuy',
      'components/Footer',
      'components/HomeLink',
      'components/HomePage',
      'components/Images/Thumbnail',
      'components/Lists',
      'components/LoadMoreButton',
      'components/MegaMenu',
      'components/MissedOffers',
      'components/MultiSearch',
      'components/PageTitle',
      'components/ProceedThroughCheckout',
      'components/Product/',
      'components/ProductDetails',
      'components/Search',
      'components/ShoppingList',
      'components/SiteHeader',
      'components/SiteSideBar',
      'components/TrolleyActions',
    ],
    'buyCheckout': [
      'components/AddGiftCard',
      'components/AddGiftVoucher',
      'components/AddToCalendar',
      'components/Checkout', 
      'components/Forms/ReduxFormFields/CardSecurityNumber',
      'components/Forms/ReduxFormFields/ExpiryDate',
      'components/GiftCard',
      'components/GiftItem',
      'components/GiftVoucher',
      'components/GiftVouchersAndCards',
      'components/OrderConfirmation',
      'components/MyPaymentCards',
      'components/OrderDetails',
      'components/OrderTotals',
      'components/PartnerDiscount', 
      'components/PaymentCard',
      'components/PaymentSavedCard',
      'components/PendingOrderSummary',
      'components/PreviousOrderSummary',
      'components/ViewOrder'
    ],
    'buyTrolley': [
      'components/Trolley/',
    ],
    'content': [
      'components/Accordion',
      'components/CmsPage',
      'components/FullWidthNavigation',
      'components/ProductPicker',
      'components/RichText',
      'components/TradingCell',
      'components/TradingComponent',
      'components/WhyWaitrose',
    ],
    'customerServiceAndComms': [
      'components/ContactUsCard',
      'components/CustomerServiceForms',
      'components/Forms/utilities/ImageUpload',
      'components/Forms/utilities/SearchSelect',
    ],
    'identity': [
      'components/Authentication',
      'components/Forms/validators/getPasswordValidator',
      'components/Login',
      'components/Logout',
      'components/Registration',
      'components/ResetPassword',
      'components/ReturnToAdmin',
      'ingredients/forms/PasswordInput',
    ],
    'loyalty': [
      'components/CookieAlert',
      'components/DigitalWallet',
      'components/LeaveMyWaitrose',
      'components/MarketingPreferences',
      'components/MyWaitrose',
      'components/OrderReplacementCard',
      'components/PromoCode',
      'components/PromoItem',
    ],
    'slots' : [
      'components/BookSlot',
    ]
  };

	export default componentPathsByTeam;