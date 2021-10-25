import { LitElement } from 'lit-element';
import { ProjectsListConsumerMixin } from '../../index.js';

export class ProjectsConsumerElement extends ProjectsListConsumerMixin(LitElement) {
}
window.customElements.define('projects-consumer-element', ProjectsConsumerElement);
