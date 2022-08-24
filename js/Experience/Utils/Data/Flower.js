import { getRandomSpherePoint } from '../Maths'

// Generate import urls
export const generateFlowerURLS = (count) => {
  const urls = []

  for (let index = 0; index < count - 1; index++) {
    urls.push(`../../assets/models/flowers/flower${index}.glb`)
  }

  return urls
}

export const createFlower = (pointX, pointZ, rotationY, flower) => {
  const f = flower.scene.clone()
  const { position, rotation } = f
  position.set(pointX, 0, pointZ)
  rotation.set(0.0, rotationY, 0.0)

  // Position
  const randomPosition = getRandomSpherePoint(position, 1 / 1.25)
  f.position.copy(randomPosition)

  // Rotate
  f.rotation.y = rotationY
  f.visible = true

  return f
}
