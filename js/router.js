import { state } from './state.js';
import { HomeScreen } from './ui/screens/HomeScreen.js';
import { DumpScreen } from './ui/screens/DumpScreen.js';
import { TimelineScreen } from './ui/screens/TimelineScreen.js';
import { PanicScreen } from './ui/screens/PanicScreen.js';
import { PackScreen } from './ui/screens/PackScreen.js';
import { SettingsScreen } from './ui/screens/SettingsScreen.js';
const screens = { home:HomeScreen, dump:DumpScreen, timeline:TimelineScreen, panic:PanicScreen, pack:PackScreen, settings:SettingsScreen };
export function navigate(route) { state.route = screens[route] ? route : 'home'; history.replaceState(null, '', `#${state.route}`); render(); }
export function render() {
  const app = document.getElementById('app');
  const Screen = screens[state.route] || HomeScreen;
  app.innerHTML = Screen();
  document.querySelectorAll('[data-route]').forEach(btn => btn.classList.toggle('active', btn.dataset.route === state.route));
  app.focus({ preventScroll:true });
  window.dispatchEvent(new CustomEvent('screen:rendered', { detail:{ route:state.route } }));
}
export function initRouter() {
  document.addEventListener('click', e => { const target = e.target.closest('[data-route]'); if (target) navigate(target.dataset.route); });
  addEventListener('hashchange', () => navigate(location.hash.slice(1) || 'home'));
}
