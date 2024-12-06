import 'vue-router';
import type { Order } from './orders';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
  }
  
  interface StateTree {
    order?: Order;
  }
} 