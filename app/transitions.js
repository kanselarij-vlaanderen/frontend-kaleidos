export default function(){
  // Add your transitions here, like:
    this.transition(
        // this.fromRoute(null),
        this.use('toLeft', { duration: 100, easing: 'easeInOut' }),
        this.reverse('toRight', { duration: 500, easing: 'easeInOut' })
    );

}
