int buttonPin = 8;
int buzzerPin = A1;
int lightPin = A0;

float hasBeenSwiped = 0;
float hasBeenShaken = 0;

int temperature;
int old_temperature;

int light;
int old_light;

int buttonState;
int old_buttonState;
int heldAlreadySent;

unsigned long millis_held;
unsigned long firstTime;

void setup()
{
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(buzzerPin, OUTPUT);

  Serial.begin(57600);

  temperature = 0;
  old_temperature = 0;

  light = 0;
  old_light = 0;

  buttonState = HIGH;
  old_buttonState = HIGH;
  heldAlreadySent = false;
}

void loop()
{

  // CHECK BUTTON

  buttonState = digitalRead(buttonPin);
  if (buttonState == LOW && old_buttonState == HIGH)
  {
    firstTime = millis();
  }
  if (buttonState == LOW)
  {
    millis_held = (millis() - firstTime);
    if (millis_held > 500 && !heldAlreadySent)
    {
      heldAlreadySent = true;
      Serial.print("{\"button\":\"held\"}\n");
    }
  }
  if (buttonState == HIGH && old_buttonState == LOW && millis_held < 500)
  {
    Serial.print("{\"button\":\"pressed\"}\n");
  }
  if (buttonState == HIGH)
  {
    heldAlreadySent = false;
  }
  old_buttonState = buttonState;

  // CHECK TEMPERATURE

  temperature = Bean.getTemperature();
  if (temperature != old_temperature && temperature > 0) // > 0 temporal fix, device sometimes sends 0 and negative values
  {
    char temperatureMessage[64];
    sprintf(temperatureMessage, "{\"temperature\":%d}\n", temperature);
    Serial.print(temperatureMessage);
  }
  old_temperature = temperature;

  // CHECK LIGHT

  light = map(analogRead(lightPin), 0, 60, 0, 100);
  //light = analogRead(lightPin);
  //if (light != old_light)
  if (abs(light - old_light) > 10)
  {
    char lightMessage[64];
    sprintf(lightMessage, "{\"light\":%d}\n", light);
    Serial.print(lightMessage);
  }
  old_light = light;

  // CHECK SHAKE

  AccelerationReading accel = Bean.getAcceleration();
  int x = accel.xAxis;
  int y = accel.yAxis;
  int z = accel.zAxis;
  if (abs(x) < 20)
  {
    x = 0;
  }
  if (abs(y) < 20)
  {
    y = 0;
  }
  if (abs(z) < 20)
  {
    z = 0;
  }
  hasBeenShaken = sqrt(x * x + y * y + z * z);
  if (hasBeenShaken >= 10)
  {
    char shakeMessage[64];
    sprintf(shakeMessage, "{\"shake\":%d}\n", hasBeenShaken);
    //  Serial.print(shakeMessage);
    //  Serial.print("{\"accelerometer\":\"shaken\"}\n");
  }

  while (Serial.available() != 0)
  {
    // Serial.print(Serial.available());
    int messageReceived = Serial.parseInt();
    // Serial.print(messageReceived);
    if (messageReceived == 5)
    {
      tone(buzzerPin, 260, 2000);
    }
  }
}
