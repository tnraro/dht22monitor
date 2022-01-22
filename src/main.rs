use gpio_cdev::{Chip, LineRequestFlags};
fn main() -> std::result::Result<(), gpio_cdev::Error> {
  let mut chip = Chip::new("/dev/gpiochip0")?;
  let handle = chip
    .get_line(4)?
    .request(LineRequestFlags::INPUT, 0, "readinput")?;
  for _ in 0..4 {
    println!("Value: {:?}", handle.get_value()?);
  }
  Ok(())
}
